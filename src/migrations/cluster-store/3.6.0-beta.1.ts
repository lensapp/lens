// Move embedded kubeconfig into separate file and add reference to it to cluster settings

import path from "path"
import { app, remote } from "electron"
import { migration } from "../migration-wrapper";
import { ensureDirSync } from "fs-extra"
import { writeEmbeddedKubeConfig } from "../../common/utils/kubeconfig"
import { ClusterModel } from "../../common/cluster-store";

export default migration({
  version: "3.6.0-beta.1",
  run(store, log: (...args: any[]) => void) {
    const migratedClusters: ClusterModel[] = []
    const storedClusters: ClusterModel[] = store.get("clusters");
    const kubeConfigBase = path.join((app || remote.app).getPath("userData"), "kubeconfigs")

    if (!storedClusters) return;
    ensureDirSync(kubeConfigBase);

    log("Number of clusters to migrate: ", storedClusters.length)
    for (const cluster of storedClusters) {
      try {
        // take the embedded kubeconfig and dump it into a file
        cluster.kubeConfigPath = writeEmbeddedKubeConfig(cluster.id, cluster.kubeConfig)
        migratedClusters.push(cluster)
      } catch (error) {
        log(`Failed to migrate Kubeconfig for cluster "${cluster.id}"`, error)
      }
    }

    // "overwrite" the cluster configs
    if (migratedClusters.length > 0) {
      store.set("clusters", migratedClusters)
    }
  }
})
