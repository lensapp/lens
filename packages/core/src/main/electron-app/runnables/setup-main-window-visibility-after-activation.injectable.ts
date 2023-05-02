/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";

const setupMainWindowVisibilityAfterActivationInjectable = getInjectable({
  id: "setup-main-window-visibility-after-activation",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);
      const showApplicationWindow = di.inject(showApplicationWindowInjectable);
      const logger = di.inject(loggerInjectionToken);

      app.on("activate", (_, windowIsVisible) => {
        logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

        if (!windowIsVisible) {
          void showApplicationWindow();
        }
      });
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupMainWindowVisibilityAfterActivationInjectable;
