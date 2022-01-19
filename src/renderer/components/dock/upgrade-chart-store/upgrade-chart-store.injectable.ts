/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { UpgradeChartStore } from "./upgrade-chart.store";
import releaseStoreInjectable from "../../+apps-releases/release-store.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";
import createDockTabStoreInjectable from "../dock-tab-store/create-dock-tab-store.injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

const upgradeChartStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createDockTabStore = di.inject(createDockTabStoreInjectable);

    const valuesStore = createDockTabStore<string>();

    return new UpgradeChartStore({
      releaseStore: di.inject(releaseStoreInjectable),
      dockStore: di.inject(dockStoreInjectable),
      createStorage: di.inject(createStorageInjectable),
      valuesStore,
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default upgradeChartStoreInjectable;
