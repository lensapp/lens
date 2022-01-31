/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import logTabStoreInjectable from "./tab-store.injectable";

const clearLogTabDataInjectable = getInjectable({
  instantiate: (di) => {
    const logTabStore = di.inject(logTabStoreInjectable);

    return (tabId: TabId): void => {
      logTabStore.clearData(tabId);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default clearLogTabDataInjectable;
