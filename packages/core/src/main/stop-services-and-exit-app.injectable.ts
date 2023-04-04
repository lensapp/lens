/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterManagerInjectable from "./cluster/manager.injectable";
import loggerInjectable from "../common/logger.injectable";
import closeAllWindowsInjectable from "./start-main-application/lens-window/hide-all-windows/close-all-windows.injectable";
import emitAppEventInjectable from "../common/app-event-bus/emit-event.injectable";
import stopAllExtensionsInjectable from "../features/extensions/stopping/main/stop-all.injectable";
import { runManyFor } from "../common/runnable/run-many-for";
import { beforeQuitOfBackEndInjectionToken } from "./start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import exitAppInjectable from "./electron-app/features/exit-app.injectable";
import { startableStoppableMap } from "../common/utils/get-startable-stoppable";

const stopServicesAndExitAppInjectable = getInjectable({
  id: "stop-services-and-exit-app",

  instantiate: (di) => {
    // const app = di.inject(electronAppInjectable);
    const runMany = runManyFor(di);
    const runRunnablesBeforeQuitOfBackEnd = runMany(
      beforeQuitOfBackEndInjectionToken
    );

    const exitApp = di.inject(exitAppInjectable);
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
      await runRunnablesBeforeQuitOfBackEnd();

      console.log([...startableStoppableMap.entries()]);

      logger.info("SERVICE:QUIT");
      setTimeout(exitApp, 5000);
    };
  },
});

export default stopServicesAndExitAppInjectable;
