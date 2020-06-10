// Add existing clusters to "default" workspace
export function migration(store: any) {
  console.log("CLUSTER STORE, MIGRATION: 2.7.0-beta.0");
  for (const value of store) {
    const clusterKey = value[0];
    if(clusterKey === "__internal__") continue
    const cluster = value[1];
    cluster.workspace = "default"
    store.set(clusterKey, cluster)
  }
}
