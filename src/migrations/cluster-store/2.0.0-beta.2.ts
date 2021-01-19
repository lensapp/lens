/* Early store format had the kubeconfig directly under context name, this moves
     it under the kubeConfig key */

import { migration } from "../migration-wrapper";

export default migration({
  version: "2.0.0-beta.2",
  run(store) {
    for (const value of store) {
      const contextName = value[0];

      // Looping all the keys gives out the store internal stuff too...
      if (contextName === "__internal__" || value[1].hasOwnProperty("kubeConfig")) continue;
      store.set(contextName, { kubeConfig: value[1] });
    }
  }
});
