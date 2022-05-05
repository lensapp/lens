/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";

const setupMainWindowVisibilityAfterActivationInjectable = getInjectable({
  id: "setup-main-window-visibility-after-activation",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const logger = di.inject(loggerInjectable);

    return {
      run: () => {
        app.on("activate", async (_, windowIsVisible) => {
          logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

          if (!windowIsVisible) {
            await showApplicationWindow();
          }
        });
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupMainWindowVisibilityAfterActivationInjectable;
