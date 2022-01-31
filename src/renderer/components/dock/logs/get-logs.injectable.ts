/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import logStoreInjectable from "./store.injectable";

const getLogsInjectable = getInjectable({
  instantiate: (di) => {
    const logStore = di.inject(logStoreInjectable);

    return (tabId: string): string[] => logStore.getLogs(tabId);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default getLogsInjectable;
