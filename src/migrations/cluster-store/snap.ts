// Fix embedded kubeconfig paths under snap config

import { migration } from "../migration-wrapper";
import { ClusterModel, ClusterStore } from "../../common/cluster-store";
import { getAppVersion } from "../../common/utils/app-version";
import fs from "fs"

export default migration({
  version: getAppVersion(), // Run always after upgrade
  run(store, printLog) {
    if (!process.env["SNAP"]) return;

    printLog("Migrating embedded kubeconfig paths")
    const storedClusters: ClusterModel[] = store.get("clusters") || [];
    if (!storedClusters.length) return;

    printLog("Number of clusters to migrate: ", storedClusters.length)
    const migratedClusters = storedClusters
      .map(cluster => {
        /**
         * replace snap version with 'current' in kubeconfig path
         */
        if (!fs.existsSync(cluster.kubeConfigPath)) {
          const kubeconfigPath = cluster.kubeConfigPath.replace(/\/snap\/kontena-lens\/[0-9]*\//, "/snap/kontena-lens/current/")
          cluster.kubeConfigPath = kubeconfigPath
        }
        return cluster;
      })


    store.set("clusters", migratedClusters)
  }
})
