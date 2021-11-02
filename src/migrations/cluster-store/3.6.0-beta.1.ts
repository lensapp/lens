/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import path from "path";
import fse from "fs-extra";
import { loadConfigFromFileSync } from "../../common/kube-helpers";
import { MigrationDeclaration, migrationLog } from "../helpers";
import type { ClusterModel } from "../../common/cluster-types";
import { getCustomKubeConfigPath, storedKubeConfigFolder } from "../../common/utils";
import { AppPaths } from "../../common/app-paths";

interface Pre360ClusterModel extends ClusterModel {
  kubeConfig: string;
}

export default {
  version: "3.6.0-beta.1",
  run(store) {
    const userDataPath = AppPaths.get("userData");
    const storedClusters: Pre360ClusterModel[] = store.get("clusters") ?? [];
    const migratedClusters: ClusterModel[] = [];

    fse.ensureDirSync(storedKubeConfigFolder());

    migrationLog("Number of clusters to migrate: ", storedClusters.length);

    for (const clusterModel of storedClusters) {
      /**
       * migrate kubeconfig
       */
      try {
        const absPath = getCustomKubeConfigPath(clusterModel.id);

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
} as MigrationDeclaration;
