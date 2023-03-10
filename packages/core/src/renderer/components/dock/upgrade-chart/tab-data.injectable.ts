/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { waitUntilDefined } from "@k8slens/utilities";
import upgradeChartTabStoreInjectable from "./store.injectable";

const upgradeChartTabDataInjectable = getInjectable({
  id: "upgrade-chart-tab-data",
  instantiate: (di, tabId) => {
    const upgradeChartTabStore = di.inject(upgradeChartTabStoreInjectable);

    return waitUntilDefined(() => upgradeChartTabStore.getData(tabId));
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, tabId: string) => tabId,
  }),
});

export default upgradeChartTabDataInjectable;
