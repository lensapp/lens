/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import exitAppInjectable from "./electron-app/features/exit-app.injectable";
import clusterManagerInjectable from "./cluster-manager.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import loggerInjectable from "../common/logger.injectable";
import hideAllWindowsInjectable from "./start-main-application/lens-window/hide-all-windows/hide-all-windows.injectable";

const stopServicesAndExitAppInjectable = getInjectable({
  id: "stop-services-and-exit-app",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const appEventBus = di.inject(appEventBusInjectable);
    const logger = di.inject(loggerInjectable);
    const hideAllWindows = di.inject(hideAllWindowsInjectable);

    return () => {
      appEventBus.emit({ name: "service", action: "close" });
      hideAllWindows();
      clusterManager.stop();
      logger.info("SERVICE:QUIT");
      setTimeout(exitApp, 1000);
    };
  },
});

export default stopServicesAndExitAppInjectable;
