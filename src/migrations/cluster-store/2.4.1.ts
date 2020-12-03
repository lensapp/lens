// Cleans up a store that had the state related data stored
import { migration } from "../migration-wrapper";

export default migration({
  version: "2.4.1",
  run(store) {
    for (const value of store) {
      const contextName = value[0];

      if (contextName === "__internal__") continue;
      const cluster = value[1];

      store.set(contextName, { kubeConfig: cluster.kubeConfig, icon: cluster.icon || null, preferences: cluster.preferences || {} });
    }
  }
});
