/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { beforeApplicationIsReadyInjectionToken } from "../before-application-is-ready-injection-token";
import whenApplicationIsActivatedInjectable from "../../../electron-app/when-application-is-activated.injectable";

const setupMainWindowVisibilityInjectable = getInjectable({
  id: "setup-main-window-visibility",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const whenApplicationIsActivated = di.inject(whenApplicationIsActivatedInjectable);

    return {
      run: () => {
        whenApplicationIsActivated(async ({ windowIsVisible }) => {
          logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

          if (!windowIsVisible) {
            await windowManager.ensureMainWindow(false);
          }
        });

      },
    };
  },

  injectionToken: beforeApplicationIsReadyInjectionToken,
});

export default setupMainWindowVisibilityInjectable;
