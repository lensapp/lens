// Move embedded kubeconfig into separate file and add reference to it to cluster settings
// convert file path cluster icons to their base64 encoded versions

import path from "path"
import { app, remote } from "electron"
import { migration } from "../migration-wrapper";
import fse from "fs-extra"
import { ClusterModel } from "../../common/cluster-store";
import { loadConfig, saveConfigToAppFiles } from "../../common/kube-helpers";
import makeSynchronous from "make-synchronous"

const AsyncFunction = Object.getPrototypeOf(async function () { return }).constructor;
const getFileTypeFnString = `return require("file-type").fromBuffer(fileData)`;
const getFileType = new AsyncFunction("fileData", getFileTypeFnString);

export default migration({
  version: "3.6.0-beta.1",
  run(store, printLog) {
    const userDataPath = (app || remote.app).getPath("userData")
    const kubeConfigBase = path.join(userDataPath, "kubeconfigs")
    const storedClusters: ClusterModel[] = store.get("clusters") || [];

    if (!storedClusters.length) return;
    fse.ensureDirSync(kubeConfigBase);

    printLog("Number of clusters to migrate: ", storedClusters.length)
    const migratedClusters = storedClusters
      .map(cluster => {
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
          if (cluster.preferences?.icon) {
            printLog(`migrating ${cluster.preferences.icon} for ${cluster.preferences.clusterName}`)
            const iconPath = cluster.preferences.icon.replace("store://", "")
            const fileData = fse.readFileSync(path.join(userDataPath, iconPath));
            const { mime = "" } = makeSynchronous(getFileType)(fileData);

            if (!mime) {
              printLog(`mime type not detected for ${cluster.preferences.clusterName}'s icon: ${iconPath}`)
            }

            cluster.preferences.icon = `data:${mime};base64, ${fileData.toString('base64')}`;
          } else {
            delete cluster.preferences?.icon;
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
