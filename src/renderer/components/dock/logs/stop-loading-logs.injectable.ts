/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const stopLoadingLogsInjectable = getInjectable({
  id: "stop-loading-logs",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: string): void => logStore.stopLoadingLogs(tabId);
  },
});

export default stopLoadingLogsInjectable;
