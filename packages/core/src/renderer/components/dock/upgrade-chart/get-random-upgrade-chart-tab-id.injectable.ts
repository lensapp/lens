/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getRandomIdInjectable from "../../../../common/utils/get-random-id.injectable";

const getRandomUpgradeChartTabIdInjectable = getInjectable({
  id: "get-random-upgrade-chart-tab-id",
  instantiate: (di) => di.inject(getRandomIdInjectable),
});

export default getRandomUpgradeChartTabIdInjectable;
