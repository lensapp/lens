/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../logger/logger.injectable";
import windowManagerInjectable from "../window/manager.injectable";
import clusterManagerInjectable from "../cluster/manager.injectable";
import electronAppInjectable from "../app-paths/get-electron-app-path/electron-app/electron-app.injectable";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";

export type ExitApp = () => void;

const exitAppInjectable = getInjectable({
  id: "exit-app",
  instantiate: (di): ExitApp => {
    const logger = di.inject(loggerInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const app = di.inject(electronAppInjectable);
    const appEventBus = di.inject(appEventBusInjectable);

    return () => {
      appEventBus.emit({ name: "service", action: "close" });
      windowManager.hide();
      clusterManager.stop();
      logger.info("SERVICE:QUIT");
      setTimeout(() => {
        app.exit();
      }, 1000);
    };
  },
});

export default exitAppInjectable;
