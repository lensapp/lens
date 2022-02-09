/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TabId } from "../dock/store";
import upgradeChartTabStoreInjectable from "./store.injectable";

const clearUpgradeChartTabDataInjectable = getInjectable({
  id: "clear-upgrade-chart-tab-data",

  instantiate: (di) => {
    const upgradeChartTabStore = di.inject(upgradeChartTabStoreInjectable);

    return (tabId: TabId) => {
      upgradeChartTabStore.clearData(tabId);
    };
  },
});

export default clearUpgradeChartTabDataInjectable;
