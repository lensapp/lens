/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { DockTabStore } from "../dock-tab/store";

const upgradeChartValuesInjectable = getInjectable({
  instantiate: () => new DockTabStore<string>({}),
  lifecycle: lifecycleEnum.singleton,
});

export default upgradeChartValuesInjectable;
