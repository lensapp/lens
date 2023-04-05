/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import forceAppExitInjectable from "./electron-app/features/force-app-exit.injectable";
import clusterManagerInjectable from "./cluster/manager.injectable";
import loggerInjectable from "../common/logger.injectable";
import closeAllWindowsInjectable from "./start-main-application/lens-window/hide-all-windows/close-all-windows.injectable";
import emitAppEventInjectable from "../common/app-event-bus/emit-event.injectable";
import stopAllExtensionsInjectable from "../features/extensions/stopping/main/stop-all.injectable";

const stopServicesAndExitAppInjectable = getInjectable({
  id: "stop-services-and-exit-app",

  instantiate: (di) => {
    const forceAppExit = di.inject(forceAppExitInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);
    const logger = di.inject(loggerInjectable);
    const closeAllWindows = di.inject(closeAllWindowsInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const stopAllExtensions = di.inject(stopAllExtensionsInjectable);

    return async () => {
      emitAppEvent({ name: "service", action: "close" });
      closeAllWindows();
      clusterManager.stop();
      await stopAllExtensions();
      logger.info("SERVICE:QUIT");
      setTimeout(forceAppExit, 1000);
    };
  },
});

export default stopServicesAndExitAppInjectable;
