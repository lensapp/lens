/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { powerMonitor } from "electron";

const powerMonitorInjectable = getInjectable({
  id: "power-monitor",
  instantiate: () => powerMonitor,
  causesSideEffects: true,
});

export default powerMonitorInjectable;
