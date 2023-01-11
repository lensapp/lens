/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const getLogsInjectable = getInjectable({
  id: "get-logs",

  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: string): string[] => logStore.getLogs(tabId);
  },
});

export default getLogsInjectable;
