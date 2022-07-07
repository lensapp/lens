/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import { loadConfigFromString } from "../../../common/kube-helpers";
import type { ClusterModel } from "../../../common/cluster-types";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import getCustomKubeConfigDirectoryInjectable from "../../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationDeclarationInjectionToken } from "./migration";
import migrationLogInjectable from "../log.injectable";
import fsInjectable from "../../../common/fs/fs.injectable";
import readFileSyncInjectable from "../../../common/fs/read-file-sync.injectable";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

interface Pre360ClusterModel extends ClusterModel {
  kubeConfig?: string;
}


const clusterStoreV360Beta1MigrationInjectable = getInjectable({
  id: "cluster-store-v3.6.0-beta.1-migration",
  instantiate: (di) => {
    const migrationLog = di.inject(migrationLogInjectable);
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const kubeConfigsPath = di.inject(directoryForKubeConfigsInjectable);
    const getCustomKubeConfigDirectory = di.inject(getCustomKubeConfigDirectoryInjectable);
    const { ensureDirSync, writeFileSync } = di.inject(fsInjectable);
    const readFileSync = di.inject(readFileSyncInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return {
      version: "3.6.0-beta.1",
      run(store) {
        const storedClusters = (store.get("clusters") ?? []) as Pre360ClusterModel[];
        const migratedClusters: ClusterModel[] = [];

        ensureDirSync(kubeConfigsPath);
        migrationLog("Number of clusters to migrate: ", storedClusters.length);

        for (const clusterModel of storedClusters) {
          /**
           * migrate kubeconfig
           */
          try {
            const absPath = getCustomKubeConfigDirectory(clusterModel.id);

            if (!clusterModel.kubeConfig) {
              continue;
            }

            // take the embedded kubeconfig and dump it into a file
            writeFileSync(absPath, clusterModel.kubeConfig, { encoding: "utf-8", mode: 0o600 });

            clusterModel.kubeConfigPath = absPath;
            delete clusterModel.kubeConfig;

            const clusterConfigData = readFileSync(clusterModel.kubeConfigPath);
            const clusterConfig = loadConfigFromString(clusterConfigData);

            clusterModel.contextName = clusterConfig.config.getCurrentContext();
          } catch (error) {
            migrationLog(`Failed to migrate Kubeconfig for cluster "${clusterModel.id}", removing clusterModel...`, error);

            continue;
          }

          /**
           * migrate cluster icon
           */
          try {
            if (clusterModel.preferences?.icon) {
              migrationLog(`migrating ${clusterModel.preferences.icon} for ${clusterModel.preferences.clusterName}`);
              const iconPath = clusterModel.preferences.icon.replace("store://", "");
              const fileData = readFileSync(joinPaths(userDataPath, iconPath), { asBuffer: true });

              clusterModel.preferences.icon = `data:;base64,${fileData.toString("base64")}`;
            } else {
              delete clusterModel.preferences?.icon;
            }
          } catch (error) {
            migrationLog(`Failed to migrate cluster icon for cluster "${clusterModel.id}"`, error);
            delete clusterModel.preferences?.icon;
          }

          migratedClusters.push(clusterModel);
        }

        store.set("clusters", migratedClusters);
      },
    };
  },
  injectionToken: clusterStoreMigrationDeclarationInjectionToken,
});

export default clusterStoreV360Beta1MigrationInjectable;

