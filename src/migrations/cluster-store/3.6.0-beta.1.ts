// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import path from "path"
import { app, remote } from "electron"
import { migration } from "../migration-wrapper";
import fse from "fs-extra"
import fileType from "file-type";
import { ClusterModel } from "../../common/cluster-store";
import { loadConfig, saveConfigToAppFiles } from "../../common/kube-helpers";

export default migration({
  version: "3.6.0-beta.1",
  async run(store, printLog) {
    const kubeConfigBase = path.join((app || remote.app).getPath("userData"), "kubeconfigs")
    const storedClusters: ClusterModel[] = store.get("clusters") || [];

    if (!storedClusters.length) return;
    fse.ensureDirSync(kubeConfigBase);

    printLog("Number of clusters to migrate: ", storedClusters.length)
    const migratedClusters = storedClusters
      .map(async cluster => {
        /**
         * migrate kubeconfig
         */
        try {
          // take the embedded kubeconfig and dump it into a file
          cluster.kubeConfigPath = saveConfigToAppFiles(cluster.id, cluster.kubeConfig)
          cluster.contextName = loadConfig(cluster.kubeConfigPath).getCurrentContext();
          delete cluster.kubeConfig;

        } catch (error) {
          printLog(`Failed to migrate Kubeconfig for cluster "${cluster.id}", removing cluster...`, error)
          return undefined;
        }

        /**
         * migrate cluster icon
         */
        try {
          if (cluster.preferences.icon) {
            const fileData = await fse.readFile(cluster.preferences.icon);
            const { mime } = await fileType.fromBuffer(fileData);

            if (!mime) {
              throw "unknown icon file type, deleting...";
            }

            cluster.preferences.icon = `data:${mime};base64, ${fileData.toString('base64')}`;
          } else {
            delete cluster.preferences.icon;
          }
        } catch (error) {
          printLog(`Failed to migrate cluster icon for cluster "${cluster.id}"`, error)
          delete cluster.preferences.icon;
        }

        return cluster;
      })
      .filter(c => c);

    // "overwrite" the cluster configs
    if (migratedClusters.length > 0) {
      store.set("clusters", migratedClusters)
    }
  }
})
