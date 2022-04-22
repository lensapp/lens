/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { KubeObjectStore } from "../kube-object.store";
import { ApiManager } from "./api-manager";

export const kubeObjectStoreInjectionToken = getInjectionToken<KubeObjectStore<any, any, any>>({
  id: "kube-object-store-token",
});

const apiManagerInjectable = getInjectable({
  id: "api-manager",
  instantiate: (di) => {
    const apiManager = new ApiManager();
    const stores = di.injectMany(kubeObjectStoreInjectionToken);

    for (const store of stores) {
      apiManager.registerStore(store);
    }

    return apiManager;
  },
});

export default apiManagerInjectable;
