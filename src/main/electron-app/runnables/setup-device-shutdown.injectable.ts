/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "../features/power-monitor.injectable";
import exitAppInjectable from "../features/exit-app.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/when-application-is-loading-injection-token";

const setupDeviceShutdownInjectable = getInjectable({
  id: "setup-device-shutdown",

  instantiate: (di) => {
    const powerMonitor = di.inject(powerMonitorInjectable);
    const exitApp = di.inject(exitAppInjectable);

    return {
      run: () => {
        powerMonitor.on("shutdown", async () => {
          exitApp();
        });
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupDeviceShutdownInjectable;
