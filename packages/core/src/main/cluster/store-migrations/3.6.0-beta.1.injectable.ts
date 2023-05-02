/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getCustomKubeConfigFilePathInjectable from "../../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";
import type { ClusterModel } from "../../../common/cluster-types";
import readFileSyncInjectable from "../../../common/fs/read-file-sync.injectable";
import { loadConfigFromString } from "../../../common/kube-helpers";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";

interface Pre360ClusterModel extends ClusterModel {
  kubeConfig?: string;
}

import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreMigrationInjectionToken } from "../../../features/cluster/storage/common/migration-token";
import readFileBufferSyncInjectable from "../../../common/fs/read-file-buffer-sync.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import writeFileSyncInjectable from "../../../common/fs/write-file-sync.injectable";

const v360Beta1ClusterStoreMigrationInjectable = getInjectable({
  id: "v3.6.0-beta.1-cluster-store-migration",
  instantiate: (di) => {
    const userDataPath = di.inject(directoryForUserDataInjectable);
    const getCustomKubeConfigDirectory = di.inject(getCustomKubeConfigFilePathInjectable);
    const readFileSync = di.inject(readFileSyncInjectable);
    const readFileBufferSync = di.inject(readFileBufferSyncInjectable);
    const joinPaths = di.inject(joinPathsInjectable);
    const logger = di.inject(loggerInjectionToken);
    const writeFileSync = di.inject(writeFileSyncInjectable);

    return {
      version: "3.6.0-beta.1",
      run: (store) => {
        const storedClusters = (store.get("clusters") ?? []) as Pre360ClusterModel[];
        const migratedClusters: ClusterModel[] = [];

        logger.info("Number of clusters to migrate: ", storedClusters.length);

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
            writeFileSync(absPath, clusterModel.kubeConfig);

            clusterModel.kubeConfigPath = absPath;
            clusterModel.contextName = loadConfigFromString(readFileSync(absPath)).config.getCurrentContext();
            delete clusterModel.kubeConfig;

          } catch (error) {
            logger.info(`Failed to migrate Kubeconfig for cluster "${clusterModel.id}", removing clusterModel...`, error);

            continue;
          }

          /**
           * migrate cluster icon
           */
          try {
            if (clusterModel.preferences?.icon) {
              logger.info(`migrating ${clusterModel.preferences.icon} for ${clusterModel.preferences.clusterName}`);
              const iconPath = clusterModel.preferences.icon.replace("store://", "");
              const fileData = readFileBufferSync(joinPaths(userDataPath, iconPath));

              clusterModel.preferences.icon = `data:;base64,${fileData.toString("base64")}`;
            } else {
              delete clusterModel.preferences?.icon;
            }
          } catch (error) {
            console.log(error);
            logger.info(`Failed to migrate cluster icon for cluster "${clusterModel.id}"`, error);
            delete clusterModel.preferences?.icon;
          }

          migratedClusters.push(clusterModel);
        }

        store.set("clusters", migratedClusters);
      },
    };
  },
  injectionToken: clusterStoreMigrationInjectionToken,
});

export default v360Beta1ClusterStoreMigrationInjectable;
