/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { createUpgradeChartTab } from "./create-upgrade-chart-tab";
import upgradeChartStoreInjectable from "../upgrade-chart-store/upgrade-chart-store.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const createUpgradeChartTabInjectable = getInjectable({
  instantiate: (di) => createUpgradeChartTab({
    upgradeChartStore: di.inject(upgradeChartStoreInjectable),
    dockStore: di.inject(dockStoreInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createUpgradeChartTabInjectable;
