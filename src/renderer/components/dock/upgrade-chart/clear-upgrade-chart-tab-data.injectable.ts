/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import upgradeChartTabStoreInjectable from "./store.injectable";

const clearUpgradeChartTabDataInjectable = getInjectable({
  instantiate: (di) => {
    const upgradeChartTabStore = di.inject(upgradeChartTabStoreInjectable);

    return (tabId: TabId) => {
      upgradeChartTabStore.clearData(tabId);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default clearUpgradeChartTabDataInjectable;
