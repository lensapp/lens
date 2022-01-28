/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { UpgradeChartTabStore } from "./store";
import upgradeChartTabStorageInjectable from "./storage.injectable";

const upgradeChartTabStoreInjectable = getInjectable({
  instantiate: (di) => new UpgradeChartTabStore({
    storage: di.inject(upgradeChartTabStorageInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default upgradeChartTabStoreInjectable;
