/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LogTabData } from "./tab-store";
import logTabStoreInjectable from "./tab-store.injectable";

const setLogTabDataInjectable = getInjectable({
  id: "set-log-tab-data",

  instantiate: (di) => {
    const logTabStore = di.inject(logTabStoreInjectable);

    return (tabId: string, data: LogTabData): void => logTabStore.setData(tabId, data);
  },
});

export default setLogTabDataInjectable;
