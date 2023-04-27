/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Namespace } from "@k8slens/kube-object";
import namespaceStoreInjectable from "./store.injectable";

export type RequestDeleteNormalNamespace = (namespace: Namespace) => Promise<void>;

const requestDeleteNormalNamespaceInjectable = getInjectable({
  id: "request-delete-normal-namespace",
  instantiate: (di): RequestDeleteNormalNamespace => {
    const namespaceStore = di.inject(namespaceStoreInjectable);

    return (namespace) => namespaceStore.remove(namespace);
  },
});

export default requestDeleteNormalNamespaceInjectable;
