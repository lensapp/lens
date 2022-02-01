/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import dockStoreInjectable from "./store.injectable";
import type { TabId } from "./store";

const renameTabInjectable = getInjectable({

  instantiate: (di) => {
    const dockStore = di.inject(dockStoreInjectable);

    return (tabId: TabId, title: string): void => {
      dockStore.renameTab(tabId, title);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default renameTabInjectable;
