/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import powerMonitorInjectable from "../features/power-monitor.injectable";
import quitAppInjectable from "../features/exit-app.injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";

const setupDeviceShutdownInjectable = getInjectable({
  id: "setup-device-shutdown",

  instantiate: (di) => ({
    run: () => {
      const powerMonitor = di.inject(powerMonitorInjectable);
      const quitApp = di.inject(quitAppInjectable);

      powerMonitor.on("shutdown", quitApp);
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDeviceShutdownInjectable;
