/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import { afterApplicationIsReadyInjectionToken } from "../../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import ensureMainWindowInjectable from "../../ensure-main-window/ensure-main-window.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const setupMainWindowVisibilityAfterActivationInjectable = getInjectable({
  id: "setup-main-window-visibility-after-activation",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const ensureMainWindow = di.inject(ensureMainWindowInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      run: () => {
        app.on("activate", async (_, windowIsVisible) => {
          logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

          if (!windowIsVisible) {
            await ensureMainWindow(false);
          }
        });
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupMainWindowVisibilityAfterActivationInjectable;
