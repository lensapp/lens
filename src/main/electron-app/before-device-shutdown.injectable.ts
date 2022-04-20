/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "./power-monitor.injectable";

const beforeDeviceShutdownInjectable = getInjectable({
  id: "before-device-shutdown",

  instantiate: (di) => {
    const powerMonitor = di.inject(powerMonitorInjectable);

    return (callback: () => Promise<void> | void) => {
      powerMonitor.on("shutdown", async () => {
        await callback();
      });
    };
  },
});

export default beforeDeviceShutdownInjectable;
