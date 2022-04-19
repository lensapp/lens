/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import shouldStartHiddenInjectable from "../../../electron-app/should-start-hidden.injectable";

const startMainWindowInjectable = getInjectable({
  id: "start-main-window",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const logger = di.inject(loggerInjectable);
    const shouldStartHidden = di.inject(shouldStartHiddenInjectable);

    return {
      run: async () => {
        logger.info("🖥️  Starting WindowManager");

        if (!shouldStartHidden) {
          await windowManager.ensureMainWindow();
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default startMainWindowInjectable;
