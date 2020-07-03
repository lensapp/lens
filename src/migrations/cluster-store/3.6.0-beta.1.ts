// move embedded kubeconfig into separate file and add reference to it to cluster settings
import { app } from "electron"
import  { ensureDirSync } from "fs-extra"
import * as path from "path"
import { KubeConfig } from "@kubernetes/client-node";
import { writeEmbeddedKubeConfig } from "../../common/utils/kubeconfig"

export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 3.6.0-beta.1");
  const clusters: any[] = []

  const kubeConfigBase = path.join(app.getPath("userData"), "kubeconfigs")
  ensureDirSync(kubeConfigBase)
  const storedClusters = store.get("clusters") as any[]
  if (!storedClusters) return

  console.log("num clusters to migrate: ", storedClusters.length)
  for (const cluster of storedClusters ) {
    try {
      // take the embedded kubeconfig and dump it into a file
      const kubeConfigFile = writeEmbeddedKubeConfig(cluster.id, cluster.kubeConfig)
      cluster.kubeConfigPath = kubeConfigFile

      const kc = new KubeConfig()
      kc.loadFromFile(cluster.kubeConfigPath)
      cluster.contextName = kc.getCurrentContext()

      delete cluster.kubeConfig
      clusters.push(cluster)
    } catch(error) {
      console.error("failed to migrate kubeconfig for cluster:", cluster.id)
    }
  }

  // "overwrite" the cluster configs
  if (clusters.length > 0) {
    store.set("clusters", clusters)
  }
}
