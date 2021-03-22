import { migration } from "../migration-wrapper";

export default migration({
  version: "4.2.0",
  run(store) {
    const activeCluster = store.get("activeCluster");

    if (activeCluster) {
      store.set("activeClusterId", activeCluster);
    }
  }
});
