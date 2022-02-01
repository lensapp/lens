/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import installChartTabStoreInjectable from "./store.injectable";

const clearInstallChartTabDataInjectable = getInjectable({
  instantiate: (di) => {
    const installChartTabStore = di.inject(installChartTabStoreInjectable);

    return (tabId: TabId) => {
      installChartTabStore.clearData(tabId);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default clearInstallChartTabDataInjectable;
