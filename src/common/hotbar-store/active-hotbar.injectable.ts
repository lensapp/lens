/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import hotbarStoreInjectable from "./store.injectable";

const activeHotbarInjectable = getInjectable({
  instantiate: (di) => {
    const hotbarStore = di.inject(hotbarStoreInjectable);

    return computed(() => hotbarStore.getActive());
  },
  lifecycle: lifecycleEnum.singleton,
});

export default activeHotbarInjectable;
