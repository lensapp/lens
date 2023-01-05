/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "../features/power-monitor.injectable";
import exitAppInjectable from "../features/exit-app.injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const setupDeviceShutdownInjectable = getInjectable({
  id: "setup-device-shutdown",

  instantiate: (di) => {
    const powerMonitor = di.inject(powerMonitorInjectable);
    const exitApp = di.inject(exitAppInjectable);

    return {
      id: "setup-device-shutdown",
      run: () => {
        powerMonitor.on("shutdown", async () => {
          exitApp();
        });
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDeviceShutdownInjectable;
