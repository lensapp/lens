import { getInjectable } from "@ogre-tools/injectable";
import nodeStoreInjectable from "./store.injectable";
import { nodeStoreInjectionToken } from "@k8slens/metrics";

const nodeStoreIndirectionInjectable = getInjectable({
  id: "node-store-indirection",
  instantiate: (di) => di.inject(nodeStoreInjectable),
  injectionToken: nodeStoreInjectionToken
});

export default nodeStoreIndirectionInjectable;
