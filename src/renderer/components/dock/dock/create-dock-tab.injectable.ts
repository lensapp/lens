/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "./store.injectable";
import type { DockTab, DockTabCreate } from "./store";

const createDockTabInjectable = getInjectable({
  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (rawTabDesc: DockTabCreate, addNumber?: boolean): DockTab =>
      dockStore.createTab(rawTabDesc, addNumber);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default createDockTabInjectable;
