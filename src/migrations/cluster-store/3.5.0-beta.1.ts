// move embedded kubeconfig into separate file and add reference to it to cluster settings
import { app } from "electron"
import  { ensureDirSync, writeFileSync } from "fs-extra"
import * as path from "path"

export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 3.5.0-beta.1");
  const clusters: any[] = []
  
  const kubeConfigBase = path.join(app.getPath("userData"), "kubeconfigs")
  ensureDirSync(kubeConfigBase)
  let storedClusters = store.get("clusters") as any[]
  if (!storedClusters) return
  
  console.log("num clusters to migrate: ", storedClusters.length)
  for (let cluster of storedClusters ) {
    // take the embedded kubeconfig and dump it into a file
    const kubeConfigFile = path.join(kubeConfigBase, cluster.id)
    writeFileSync(kubeConfigFile, cluster.kubeConfig)
    delete cluster.kubeConfig
    cluster.kubeConfigPath = kubeConfigFile
    // TODO Need to parse the context name from the config


    // "overwrite" the cluster configs
    clusters.push(cluster)
  }

  if (clusters.length > 0) {
    store.set("clusters", clusters)
  }
}
