/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getRandomIdInjectable } from "@k8slens/random";

const getRandomUpgradeChartTabIdInjectable = getInjectable({
  id: "get-random-upgrade-chart-tab-id",
  instantiate: (di) => di.inject(getRandomIdInjectable),
});

export default getRandomUpgradeChartTabIdInjectable;
