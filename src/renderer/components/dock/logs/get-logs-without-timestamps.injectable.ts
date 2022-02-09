/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const getLogsWithoutTimestampsInjectable = getInjectable({
  id: "get-logs-without-timestamps",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: string): string[] =>
      logStore.getLogsWithoutTimestamps(tabId);
  },
});

export default getLogsWithoutTimestampsInjectable;
