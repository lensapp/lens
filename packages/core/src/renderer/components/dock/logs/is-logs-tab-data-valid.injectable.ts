/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import logTabStoreInjectable from "./tab-store.injectable";

const isLogsTabDataValidInjectable = getInjectable({
  id: "is-logs-tab-data-valid",

  instantiate: (di) => {
    const logTabStore = di.inject(logTabStoreInjectable);

    return (tabId: TabId) => logTabStore.isDataValid(tabId);
  },
});

export default isLogsTabDataValidInjectable;
