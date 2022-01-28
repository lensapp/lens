/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import namespaceStoreInjectable from "./store.injectable";

const namespacesInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(namespaceStoreInjectable);

    return computed(() => store.items.map(ns => ns.getName()));
  },
  lifecycle: lifecycleEnum.singleton,
});

export default namespacesInjectable;
