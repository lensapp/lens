/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../../start-main-application/when-application-is-loading/when-application-is-loading-injection-token";
import applicationWindowInjectable from "../../start-main-application/lens-window/application-window/application-window.injectable";

const setupMainWindowVisibilityAfterActivationInjectable = getInjectable({
  id: "setup-main-window-visibility-after-activation",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const applicationWindow = di.inject(applicationWindowInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      run: () => {
        app.on("activate", async (_, windowIsVisible) => {
          logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

          if (!windowIsVisible) {
            await applicationWindow.show();
          }
        });
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupMainWindowVisibilityAfterActivationInjectable;
