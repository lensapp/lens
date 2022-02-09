/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const getTimestampSplitLogsInjectable = getInjectable({
  id: "get-timestamp-split-logs",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: string): [string, string][] =>
      logStore.getTimestampSplitLogs(tabId);
  },
});

export default getTimestampSplitLogsInjectable;
