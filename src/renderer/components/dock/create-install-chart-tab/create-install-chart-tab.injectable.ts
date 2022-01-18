/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInstallChartTab } from "./create-install-chart-tab";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import installChartStoreInjectable from "../install-chart-store/install-chart-store.injectable";
import dockStoreInjectable from "../dock-store/dock-store.injectable";

const createInstallChartTabInjectable = getInjectable({
  instantiate: (di) => createInstallChartTab({
    installChartStore: di.inject(installChartStoreInjectable),
    createDockTab: di.inject(dockStoreInjectable).createTab,
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default createInstallChartTabInjectable;
