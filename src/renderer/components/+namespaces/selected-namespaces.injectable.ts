/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import namespaceFilterStoreInjectable from "./filter-store.injectable";

const selectedNamespacesInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(namespaceFilterStoreInjectable);

    return computed(() => [...store.contextNamespaces]);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default selectedNamespacesInjectable;
