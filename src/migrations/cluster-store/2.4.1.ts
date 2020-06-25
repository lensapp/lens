// Cleans up a store that had the state related data stored
import { isTestEnv } from "../../common/vars";

export function migration(store: any) {
  if (!isTestEnv) {
    console.log("CLUSTER STORE, MIGRATION: 2.4.1");
  }
  for (const value of store) {
    const contextName = value[0];
    if (contextName === "__internal__") continue;
    const cluster = value[1];

    store.set(contextName, { kubeConfig: cluster.kubeConfig, icon: cluster.icon || null, preferences: cluster.preferences || {} });
  }
}
