/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { LogTabData } from "./tab-store";
import logTabStoreInjectable from "./tab-store.injectable";

const getLogTabDataInjectable = getInjectable({
  instantiate: (di) => {
    const logTabStore = di.inject(logTabStoreInjectable);

    return (tabId: string): LogTabData => logTabStore.getData(tabId);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default getLogTabDataInjectable;
