/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { KubeObjectStore } from "../kube-object.store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const kubeObjectStoreInjectionToken = getInjectionToken<KubeObjectStore<any, any, any>>({
  id: "kube-object-store-token",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface KubeStoreInjectableParts<Store extends KubeObjectStore<any, any, any>> {
  id: string;
  instantiate: (di: DiContainerForInjection) => Store;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKubeStoreInjectable = <Store extends KubeObjectStore<any, any, any>>(parts: KubeStoreInjectableParts<Store>) => getInjectable({
  id: parts.id,
  instantiate: (di) => parts.instantiate(di),
  injectionToken: kubeObjectStoreInjectionToken,
});
