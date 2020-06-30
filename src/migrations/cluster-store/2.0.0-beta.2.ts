/* Early store format had the kubeconfig directly under context name, this moves
     it under the kubeConfig key */

import { isTestEnv } from "../../common/vars";

export function migration(store: any) {
  if(!isTestEnv) {
    console.log("CLUSTER STORE, MIGRATION: 2.0.0-beta.2");
  }
  for (const value of store) {
    const contextName = value[0];
    // Looping all the keys gives out the store internal stuff too...
    if(contextName === "__internal__" || value[1].hasOwnProperty('kubeConfig')) continue;

    store.set(contextName, { kubeConfig: value[1] });
  }
}
