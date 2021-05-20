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
import { app, remote } from "electron";
import { migration } from "../migration-wrapper";
import fse from "fs-extra";
import { ClusterModel, ClusterStore } from "../../common/cluster-store";
import { loadConfig } from "../../common/kube-helpers";

export default migration({
  version: "3.6.0-beta.1",
  run(store, printLog) {
    const userDataPath = (app || remote.app).getPath("userData");
    const kubeConfigBase = ClusterStore.getCustomKubeConfigPath("");
    const storedClusters: ClusterModel[] = store.get("clusters") || [];

    if (!storedClusters.length) return;
    fse.ensureDirSync(kubeConfigBase);

    printLog("Number of clusters to migrate: ", storedClusters.length);
    const migratedClusters = storedClusters
      .map(cluster => {
        /**
         * migrate kubeconfig
         */
        try {
          // take the embedded kubeconfig and dump it into a file
          cluster.kubeConfigPath = ClusterStore.embedCustomKubeConfig(cluster.id, cluster.kubeConfig);
          cluster.contextName = loadConfig(cluster.kubeConfigPath).getCurrentContext();
          delete cluster.kubeConfig;

        } catch (error) {
          printLog(`Failed to migrate Kubeconfig for cluster "${cluster.id}", removing cluster...`, error);

          return undefined;
        }

        /**
         * migrate cluster icon
         */
        try {
          if (cluster.preferences?.icon) {
            printLog(`migrating ${cluster.preferences.icon} for ${cluster.preferences.clusterName}`);
            const iconPath = cluster.preferences.icon.replace("store://", "");
            const fileData = fse.readFileSync(path.join(userDataPath, iconPath));

            cluster.preferences.icon = `data:;base64,${fileData.toString("base64")}`;
          } else {
            delete cluster.preferences?.icon;
          }
        } catch (error) {
          printLog(`Failed to migrate cluster icon for cluster "${cluster.id}"`, error);
          delete cluster.preferences.icon;
        }

        return cluster;
      })
      .filter(c => c);

    // "overwrite" the cluster configs
    if (migratedClusters.length > 0) {
      store.set("clusters", migratedClusters);
    }
  }
});
