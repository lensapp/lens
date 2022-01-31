/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { UpgradeChartTabStore } from "./store";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const upgradeChartTabStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    return new UpgradeChartTabStore({
      createStorage: di.inject(createStorageInjectable),
      valuesStore: createDockTabStore<string>(),
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default upgradeChartTabStoreInjectable;
