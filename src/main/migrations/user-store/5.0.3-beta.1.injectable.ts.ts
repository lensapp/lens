/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import os from "os";
import type { ClusterStoreModel } from "../../../common/cluster-store/store";
import type { KubeconfigSyncEntry, UserPreferencesStoreModel } from "../../../common/user-preferences";
import { MigrationDeclaration, migrationLog } from "../helpers";
import { isLogicalChildPath } from "../../../common/utils";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data.injectable";

interface Dependencies {
  userDataPath: string;
  kubeConfigsPath: string;
}

function getMigration({ userDataPath, kubeConfigsPath }: Dependencies): MigrationDeclaration<UserPreferencesStoreModel> {
  return {
    version: "5.0.3-beta.1",
    run(store) {
      try {
        const { syncKubeconfigEntries = [], ...preferences } = store.get("preferences") ?? {};
        const { clusters = [] }: ClusterStoreModel = JSON.parse(readFileSync(path.resolve(userDataPath, "lens-cluster-store.json"), "utf-8")) ?? {};
        const extensionDataDir = path.resolve(userDataPath, "extension_data");
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
        if (error.code !== "ENOENT") {
        // ignore files being missing
          throw error;
        }
      }
    },
  };
}

const version503Beta1Injecable = getInjectable({
  instantiate: (di) => getMigration({
    kubeConfigsPath: di.inject(directoryForKubeConfigsInjectable),
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default version503Beta1Injecable;
