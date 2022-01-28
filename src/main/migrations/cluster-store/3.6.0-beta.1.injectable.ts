/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import path from "path";
import fse from "fs-extra";
import { loadConfigFromFileSync } from "../../../common/kube-helpers";
import { MigrationDeclaration, migrationLog } from "../helpers";
import type { ClusterModel } from "../../../common/cluster-types";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getCustomKubeConfigDirectoryInjectable from "../../../common/app-paths/get-custom-kube-config-directory.injectable";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data.injectable";
import type { ClusterStoreModel } from "../../../common/cluster-store/store";

interface Pre360ClusterModel extends ClusterModel {
  kubeConfig: string;
}

interface Dependencies {
  userDataPath: string;
  kubeConfigsPath: string;
  getCustomKubeConfigDirectory: (id: string) => string;
}

function getMigration({ userDataPath, kubeConfigsPath, getCustomKubeConfigDirectory }: Dependencies): MigrationDeclaration<ClusterStoreModel> {
  return {
    version: "3.6.0-beta.1",
    run(store) {
      const storedClusters = store.get("clusters") as Pre360ClusterModel[] ?? [];
      const migratedClusters: ClusterModel[] = [];

      fse.ensureDirSync(kubeConfigsPath);

      migrationLog("Number of clusters to migrate: ", storedClusters.length);

      for (const clusterModel of storedClusters) {
      /**
       * migrate kubeconfig
       */
        try {
          const absPath = getCustomKubeConfigDirectory(clusterModel.id);

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
          delete clusterModel.preferences.icon;
        }

        migratedClusters.push(clusterModel);
      }

      store.set("clusters", migratedClusters);
    },
  };
}

const version360Beta1InjectableInjectable = getInjectable({
  instantiate: (di) => getMigration({
    getCustomKubeConfigDirectory: di.inject(getCustomKubeConfigDirectoryInjectable),
    kubeConfigsPath: di.inject(directoryForKubeConfigsInjectable),
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default version360Beta1InjectableInjectable;

