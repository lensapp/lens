/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { onApplicationActivationInjectionToken } from "../on-application-activation-injection-token";

const ensureVisibleMainWindowInjectable = getInjectable({
  id: "ensure-visible-main-window",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const windowManager = di.inject(windowManagerInjectable);

    return {
      run: ({ hasVisibleWindows }) => {
        logger.info("APP:ACTIVATE", { hasVisibleWindows });

        if (!hasVisibleWindows) {
          windowManager.ensureMainWindow(false);
        }
      },
    };
  },

  injectionToken: onApplicationActivationInjectionToken,
});

export default ensureVisibleMainWindowInjectable;
