// Move embedded kubeconfig into separate file and add reference to it to cluster settings

import path from "path"
import { app, remote } from "electron"
import { migration } from "../migration-wrapper";
import { ensureDirSync } from "fs-extra"
import { KubeConfig } from "@kubernetes/client-node";
import { writeEmbeddedKubeConfig } from "../../common/utils/kubeconfig"
import { ClusterModel } from "../../common/cluster-store";

export default migration({
  version: "3.6.0-beta.1",
  run(store, log: (...args: any[]) => void) {
    const migratingClusters: ClusterModel[] = []

    const kubeConfigBase = path.join((app || remote.app).getPath("userData"), "kubeconfigs")
    ensureDirSync(kubeConfigBase)
    const storedClusters: ClusterModel[] = store.get("clusters")
    if (!storedClusters) return

    log("Number of clusters to migrate: ", storedClusters.length)
    for (const cluster of storedClusters) {
      try {
        // take the embedded kubeconfig and dump it into a file
        cluster.kubeConfigPath = writeEmbeddedKubeConfig(cluster.id, cluster.kubeConfig)

        const kc = new KubeConfig()
        kc.loadFromFile(cluster.kubeConfigPath)
        cluster.contextName = kc.getCurrentContext()

        delete cluster.kubeConfig
        migratingClusters.push(cluster)
      } catch (error) {
        log(`Failed to migrate Kubeconfig for cluster "${cluster.id}"`, error)
      }
    }

    // "overwrite" the cluster configs
    if (migratingClusters.length > 0) {
      store.set("clusters", migratingClusters)
    }
  }
})
