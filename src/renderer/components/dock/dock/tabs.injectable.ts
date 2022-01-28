/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import dockStoreInjectable from "./store.injectable";

const dockTabsInjectable = getInjectable({
  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return computed(() => [...dockStore.tabs]);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default dockTabsInjectable;
