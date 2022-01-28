/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { UpgradeChartTabStore } from "./store";
import upgradeChartTabStoreInjectable from "./store.injectable";

interface Dependencies {
  upgradeChartTabStore: UpgradeChartTabStore;
}

function clearUpgradeChartTabData({ upgradeChartTabStore }: Dependencies, tabId: TabId) {
  upgradeChartTabStore.clearData(tabId);
}

const clearUpgradeChartTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearUpgradeChartTabData, null, {
    upgradeChartTabStore: di.inject(upgradeChartTabStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearUpgradeChartTabDataInjectable;

