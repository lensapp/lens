/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { existsSync } from "fs";
import path from "path";
import os from "os";
import type { ClusterStoreModel } from "../../../common/cluster-store/cluster-store";
import type { KubeconfigSyncEntry } from "../../../common/user-store";
import { hasTypedProperty, isErrnoException, isLogicalChildPath } from "../../../common/utils";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import migrationLogInjectable from "../log.injectable";
import { userStoreMigrationDeclarationInjectionToken } from "./migration";
import { isObject } from "lodash";
import readFileSyncInjectable from "../../../common/fs/read-file-sync.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

const userStoreV503Beta1MigrationInjectable = getInjectable({
  id: "user-store-v5.0.3-beta.1-migration",
  instantiate: (di) => {
    const migrationLog = di.inject(migrationLogInjectable);
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const kubeConfigsPath = di.inject(directoryForKubeConfigsInjectable);
    const readFileSync = di.inject(readFileSyncInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return {
      version: "5.0.3-beta.1",
      run(store) {
        try {
          const preferences = store.get("preferences");

          if (!isObject(preferences)) {
            store.delete("preferences");

            return;
          }

          if (!hasTypedProperty(preferences, "syncKubeconfigEntries", Array.isArray)) {
            return;
          }

          const { syncKubeconfigEntries } = preferences;

          const { clusters = [] }: ClusterStoreModel = JSON.parse(readFileSync(joinPaths(userDataPath, "lens-cluster-store.json"))) ?? {};
          const extensionDataDir = joinPaths(userDataPath, "extension_data");
          const syncPaths = new Set(syncKubeconfigEntries.map(s => s.filePath));

          syncPaths.add(path.join(os.homedir(), ".kube"));

          for (const cluster of clusters) {
            if (!cluster.kubeConfigPath) {
              continue;
            }
            const dirOfKubeconfig = path.dirname(cluster.kubeConfigPath);

            if (dirOfKubeconfig === kubeConfigsPath) {
              migrationLog(`Skipping ${cluster.id} because kubeConfigPath is under the stored KubeConfig folder`);
              continue;
            }

            if (syncPaths.has(cluster.kubeConfigPath) || syncPaths.has(dirOfKubeconfig)) {
              migrationLog(`Skipping ${cluster.id} because kubeConfigPath is already being synced`);
              continue;
            }

            if (isLogicalChildPath(extensionDataDir, cluster.kubeConfigPath)) {
              migrationLog(`Skipping ${cluster.id} because kubeConfigPath is placed under an extension_data folder`);
              continue;
            }

            if (!existsSync(cluster.kubeConfigPath)) {
              migrationLog(`Skipping ${cluster.id} because kubeConfigPath no longer exists`);
              continue;
            }

            migrationLog(`Adding ${cluster.kubeConfigPath} from ${cluster.id} to sync paths`);
            syncPaths.add(cluster.kubeConfigPath);
          }

          const updatedSyncEntries: KubeconfigSyncEntry[] = [...syncPaths].map(filePath => ({ filePath }));

          migrationLog("Final list of synced paths", updatedSyncEntries);
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
  injectionToken: userStoreMigrationDeclarationInjectionToken,
});

export default userStoreV503Beta1MigrationInjectable;

