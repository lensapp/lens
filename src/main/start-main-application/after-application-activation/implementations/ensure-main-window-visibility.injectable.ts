/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { afterApplicationActivationInjectionToken } from "../after-application-activation-injection-token";

const ensureMainWindowVisibilityInjectable = getInjectable({
  id: "ensure-main-window-visibility",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const windowManager = di.inject(windowManagerInjectable);

    return {
      run: async ({ windowIsVisible }) => {
        logger.info("APP:ACTIVATE", { hasVisibleWindows: windowIsVisible });

        if (!windowIsVisible) {
          await windowManager.ensureMainWindow(false);
        }
      },
    };
  },

  injectionToken: afterApplicationActivationInjectionToken,
});

export default ensureMainWindowVisibilityInjectable;
