// add id for clusters and store them to array
import { v4 as uuid } from "uuid"

export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 2.7.0-beta.1");
  const clusters: any[] = []
  for (const value of store) {
    const clusterKey = value[0];
    if(clusterKey === "__internal__") continue
    if(clusterKey === "clusters") continue
    const cluster = value[1];
    cluster.id = uuid()
    if (!cluster.preferences.clusterName) {
      cluster.preferences.clusterName = clusterKey
    }
    clusters.push(cluster)
    store.delete(clusterKey)
  }
  if (clusters.length > 0) {
    store.set("clusters", clusters)
  }
}
