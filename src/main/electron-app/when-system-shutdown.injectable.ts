/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "./power-monitor.injectable";

const whenSystemShutdownInjectable = getInjectable({
  id: "when-system-shutdown",

  instantiate: (di) => {
    const powerMonitor = di.inject(powerMonitorInjectable);

    return (callback: () => void) => {
      powerMonitor.on("shutdown", () => {
        callback();
      });
    };
  },
});

export default whenSystemShutdownInjectable;
