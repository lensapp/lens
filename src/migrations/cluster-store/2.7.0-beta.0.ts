// Add existing clusters to "default" workspace
import { migration } from "../migration-wrapper";

export default migration({
  version: "2.7.0-beta.0",
  run(store, log) {
    for (const value of store) {
      const clusterKey = value[0];
      if (clusterKey === "__internal__") continue;
      const cluster = value[1];
      cluster.workspace = "default";
      store.set(clusterKey, cluster);
    }
  }
});
