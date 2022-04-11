/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import electronAppInjectable from "../../../app-paths/get-electron-app-path/electron-app/electron-app.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";

const setupMainWindowVisibilityInjectable = getInjectable({
  id: "setup-main-window-visibility",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const app = di.inject(electronAppInjectable);

    return {
      run: () => {
        app.on("activate", async (_, hasVisibleWindows) => {
          logger.info("APP:ACTIVATE", { hasVisibleWindows });

          if (!hasVisibleWindows) {
            await windowManager.ensureMainWindow(false);
          }
        });
      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupMainWindowVisibilityInjectable;
