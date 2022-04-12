/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import exitAppInjectable from "./electron-app/exit-app.injectable";
import clusterManagerInjectable from "./cluster-manager.injectable";
import windowManagerInjectable from "./window-manager.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import loggerInjectable from "../common/logger.injectable";

const stopServicesAndExitAppInjectable = getInjectable({
  id: "stop-services-and-exit-app",

  instantiate: (di) => {
    const exitApp = di.inject(exitAppInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const appEventBus = di.inject(appEventBusInjectable);
    const logger = di.inject(loggerInjectable);

    return () => {
      appEventBus.emit({ name: "service", action: "close" });
      windowManager.hide();
      clusterManager.stop();
      logger.info("SERVICE:QUIT");
      setTimeout(exitApp, 1000);
    };
  },
});

export default stopServicesAndExitAppInjectable;
