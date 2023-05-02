/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isErrnoException } from "@k8slens/utilities";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import isLogicalChildPathInjectable from "../../../common/path/is-logical-child-path.injectable";
import getDirnameOfPathInjectable from "../../../common/path/get-dirname.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesMigrationInjectionToken } from "../../../features/user-preferences/common/migrations-token";
import readJsonSyncInjectable from "../../../common/fs/read-json-sync.injectable";
import homeDirectoryPathInjectable from "../../../common/os/home-directory-path.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import pathExistsSyncInjectable from "../../../common/fs/path-exists-sync.injectable";
import type { ClusterStoreModel } from "../../../features/cluster/storage/common/storage.injectable";
import type { UserPreferencesModel, KubeconfigSyncEntry } from "../common/preferences-helpers";

const v503Beta1UserPreferencesStorageMigrationInjectable = getInjectable({
  id: "v5.0.3-beta.1-preferences-storage-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const kubeConfigsPath = di.inject(directoryForKubeConfigsInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const logger = di.inject(loggerInjectionToken);
    const isLogicalChildPath = di.inject(isLogicalChildPathInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);
    const readJsonSync = di.inject(readJsonSyncInjectable);
    const homeDirectoryPath = di.inject(homeDirectoryPathInjectable);
    const pathExistsSync = di.inject(pathExistsSyncInjectable);

    return {
      version: "5.0.3-beta.1",
      run(store) {
        try {
          const { syncKubeconfigEntries = [], ...preferences } = (store.get("preferences") ?? {}) as UserPreferencesModel;
          const { clusters = [] }: ClusterStoreModel = readJsonSync(joinPaths(userDataPath, "lens-cluster-store.json"), "utf-8") ?? {};
          const extensionDataDir = joinPaths(userDataPath, "extension_data");
          const syncPaths = new Set(syncKubeconfigEntries.map(s => s.filePath));

          syncPaths.add(joinPaths(homeDirectoryPath, ".kube"));

          for (const cluster of clusters) {
            if (!cluster.kubeConfigPath) {
              continue;
            }
            const dirOfKubeconfig = getDirnameOfPath(cluster.kubeConfigPath);

            if (dirOfKubeconfig === kubeConfigsPath) {
              logger.info(`Skipping ${cluster.id} because kubeConfigPath is under the stored KubeConfig folder`);
              continue;
            }

            if (syncPaths.has(cluster.kubeConfigPath) || syncPaths.has(dirOfKubeconfig)) {
              logger.info(`Skipping ${cluster.id} because kubeConfigPath is already being synced`);
              continue;
            }

            if (isLogicalChildPath(extensionDataDir, cluster.kubeConfigPath)) {
              logger.info(`Skipping ${cluster.id} because kubeConfigPath is placed under an extension_data folder`);
              continue;
            }

            if (!pathExistsSync(cluster.kubeConfigPath)) {
              logger.info(`Skipping ${cluster.id} because kubeConfigPath no longer exists`);
              continue;
            }

            logger.info(`Adding ${cluster.kubeConfigPath} from ${cluster.id} to sync paths`);
            syncPaths.add(cluster.kubeConfigPath);
          }

          const updatedSyncEntries: KubeconfigSyncEntry[] = [...syncPaths].map(filePath => ({ filePath }));

          logger.info("Final list of synced paths", updatedSyncEntries);
          store.set("preferences", { ...preferences, syncKubeconfigEntries: updatedSyncEntries });
        } catch (error) {
          if (isErrnoException(error) && error.code !== "ENOENT") {
            // ignore files being missing
            throw error;
          }
        }
      },
    };
  },
  injectionToken: userPreferencesMigrationInjectionToken,
});

export default v503Beta1UserPreferencesStorageMigrationInjectable;
