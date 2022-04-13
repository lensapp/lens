/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import isMacInjectable from "../../../../common/vars/is-mac.injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import commandLineArgumentsInjectable from "../../../utils/command-line-arguments.injectable";

const startMainWindowInjectable = getInjectable({
  id: "start-main-window",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const app = di.inject(electronAppInjectable);
    const logger = di.inject(loggerInjectable);
    const isMac = di.inject(isMacInjectable);
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    return {
      run: async () => {

        // Start the app without showing the main window when auto starting on login
        // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
        const startHidden =
          commandLineArguments.includes("--hidden") ||
          (isMac && app.getLoginItemSettings().wasOpenedAsHidden);

        logger.info("🖥️  Starting WindowManager");

        if (!startHidden) {
          await windowManager.ensureMainWindow();
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default startMainWindowInjectable;
