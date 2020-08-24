// Move cluster icon from root to preferences
import { migration } from "../migration-wrapper";

export default migration({
  version: "2.6.0-beta.2",
  run(store, log) {
    for (const value of store) {
      const clusterKey = value[0];
      if (clusterKey === "__internal__") continue
      const cluster = value[1];
      if (!cluster.preferences) cluster.preferences = {};
      if (cluster.icon) {
        cluster.preferences.icon = cluster.icon;
        delete (cluster["icon"]);
      }
      store.set(clusterKey, { contextName: clusterKey, kubeConfig: value[1].kubeConfig, preferences: value[1].preferences });
    }
  }
})
