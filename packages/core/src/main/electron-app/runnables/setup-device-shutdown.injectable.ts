/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "../features/power-monitor.injectable";
import exitAppInjectable from "../features/exit-app.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";

const setupDeviceShutdownInjectable = getInjectable({
  id: "setup-device-shutdown",

  instantiate: (di) => ({
    run: () => {
      const powerMonitor = di.inject(powerMonitorInjectable);
      const exitApp = di.inject(exitAppInjectable);

      powerMonitor.on("shutdown", exitApp);
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDeviceShutdownInjectable;
