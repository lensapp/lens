/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "./store";
import dockStoreInjectable from "./store.injectable";

const closeDockTabInjectable = getInjectable({
  id: "close-dock-tab",

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (tabId: TabId): void => {
      dockStore.closeTab(tabId);
    };
  },
});

export default closeDockTabInjectable;
