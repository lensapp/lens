/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import path from "path";
import fse from "fs-extra";
import { loadConfigFromFileSync } from "../../common/kube-helpers";
import type { MigrationDeclaration } from "../helpers";
import { migrationLog } from "../helpers";
import type { ClusterModel } from "../../common/cluster-types";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import directoryForUserDataInjectable
  from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForKubeConfigsInjectable
  from "../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import getCustomKubeConfigDirectoryInjectable
  from "../../common/app-paths/get-custom-kube-config-directory/get-custom-kube-config-directory.injectable";

interface Pre360ClusterModel extends ClusterModel {
  kubeConfig?: string;
}

export default {
  version: "3.6.0-beta.1",
  run(store) {
    const di = getLegacyGlobalDiForExtensionApi();

    const userDataPath = di.inject(directoryForUserDataInjectable);
    const kubeConfigsPath = di.inject(directoryForKubeConfigsInjectable);
    const getCustomKubeConfigDirectory = di.inject(getCustomKubeConfigDirectoryInjectable);

    const storedClusters: Pre360ClusterModel[] = store.get("clusters") ?? [];
    const migratedClusters: ClusterModel[] = [];

    fse.ensureDirSync(kubeConfigsPath);

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
        fse.writeFileSync(absPath, clusterModel.kubeConfig, { encoding: "utf-8", mode: 0o600 });

        clusterModel.kubeConfigPath = absPath;
        clusterModel.contextName = loadConfigFromFileSync(clusterModel.kubeConfigPath).config.getCurrentContext();
        delete clusterModel.kubeConfig;

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
          const fileData = fse.readFileSync(path.join(userDataPath, iconPath));

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
} as MigrationDeclaration;
