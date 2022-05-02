/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../../start-main-application/when-application-is-loading/when-application-is-loading-injection-token";

const setupDeveloperToolsInDevelopmentEnvironmentInjectable = getInjectable({
  id: "setup-developer-tools-in-development-environment",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return {
      run: () => {
        if (process.env.NODE_ENV !== "development") {
          return;
        }

        logger.info("🤓 Installing developer tools");

        import("electron-devtools-installer")
          .then(({ default: devToolsInstaller, REACT_DEVELOPER_TOOLS }) =>
            devToolsInstaller([REACT_DEVELOPER_TOOLS]),
          )
          .then((name) =>
            logger.info(`[DEVTOOLS-INSTALLER]: installed ${name}`),
          )
          .catch((error) =>
            logger.error(`[DEVTOOLS-INSTALLER]: failed`, { error }),
          );
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default setupDeveloperToolsInDevelopmentEnvironmentInjectable;
