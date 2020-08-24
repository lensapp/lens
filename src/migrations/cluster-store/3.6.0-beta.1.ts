// Move embedded kubeconfig into separate file and add reference to it to cluster settings

import path from "path"
import { app, remote } from "electron"
import { migration } from "../migration-wrapper";
import { ensureDirSync } from "fs-extra"
import { ClusterModel } from "../../common/cluster-store";
import { loadConfig, saveConfigToAppFiles } from "../../common/kube-helpers";

export default migration({
  version: "3.6.0-beta.1",
  run(store, printLog) {
    const migratedClusters: ClusterModel[] = []
    const storedClusters: ClusterModel[] = store.get("clusters");
    const kubeConfigBase = path.join((app || remote.app).getPath("userData"), "kubeconfigs")

    if (!storedClusters) return;
    ensureDirSync(kubeConfigBase);

    printLog("Number of clusters to migrate: ", storedClusters.length)
    for (const cluster of storedClusters) {
      try {
        // take the embedded kubeconfig and dump it into a file
        cluster.kubeConfigPath = saveConfigToAppFiles(cluster.id, cluster.kubeConfig)
        cluster.contextName = loadConfig(cluster.kubeConfigPath).getCurrentContext();
        delete cluster.kubeConfig;
        migratedClusters.push(cluster)
      } catch (error) {
        printLog(`Failed to migrate Kubeconfig for cluster "${cluster.id}"`, error)
      }
    }

    // "overwrite" the cluster configs
    if (migratedClusters.length > 0) {
      store.set("clusters", migratedClusters)
    }
  }
})
