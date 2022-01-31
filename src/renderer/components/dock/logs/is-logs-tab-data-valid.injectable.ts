/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import logTabStoreInjectable from "./tab-store.injectable";

const isLogsTabDataValidInjectable = getInjectable({
  instantiate: (di) => {
    const logTabStore = di.inject(logTabStoreInjectable);

    return (tabId: TabId) => logTabStore.isDataValid(tabId);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default isLogsTabDataValidInjectable;
