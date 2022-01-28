/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { InstallChartTabStore } from "./store";
import chartVersionManagerInjectable from "./chart-version-manager.injectable";
import installChartTabStorageInjectable from "./storage.injectable";

const installChartTabStoreInjectable = getInjectable({
  instantiate: (di) => new InstallChartTabStore({
    versionsStore: di.inject(chartVersionManagerInjectable),
    storage: di.inject(installChartTabStorageInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default installChartTabStoreInjectable;
