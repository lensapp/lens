/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import namespaceStoreInjectable from "./store.injectable";

const hierarchicalNamespacesInjectable = getInjectable({
  id: "hierarchical-namespaces",

  instantiate: (di) => {
    const namespaceStore = di.inject(namespaceStoreInjectable);

    return namespaceStore.getByLabel(["hnc.x-k8s.io/included-namespace=true"]);
  },
});

export default hierarchicalNamespacesInjectable;
