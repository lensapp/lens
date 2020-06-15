// move embedded kubeconfig into separate file and add reference to it to cluster settings
import { app } from "electron"
import  { ensureDirSync, writeFileSync } from "fs-extra"
import * as path from "path"
import { KubeConfig } from "@kubernetes/client-node";
import * as clusterStore from "../../cluster-store"

export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 3.5.0-beta.1");
  const clusters: any[] = []
  
  const kubeConfigBase = path.join(app.getPath("userData"), "kubeconfigs")
  ensureDirSync(kubeConfigBase)
  let storedClusters = store.get("clusters") as any[]
  if (!storedClusters) return

  console.log("num clusters to migrate: ", storedClusters.length)
  for (let cluster of storedClusters ) {
    // TODO Should probably guard this, not to make the whole migration fail if one cluster fails!?
    // take the embedded kubeconfig and dump it into a file
    const kubeConfigFile = clusterStore.writeEmbeddedKubeConfig(cluster.id, cluster.kubeConfig)
    cluster.kubeConfigPath = kubeConfigFile
    
    const kc = new KubeConfig()
    kc.loadFromFile(cluster.kubeConfigPath)
    cluster.contextName = kc.getCurrentContext()
    
    delete cluster.kubeConfig
    clusters.push(cluster)
  }

  // "overwrite" the cluster configs
  if (clusters.length > 0) {
    store.set("clusters", clusters)
  }
}
