/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { onSecondApplicationInstanceInjectionToken } from "../on-second-application-instance-injection-token";

const setupProtocolRouterForSecondInstanceInjectable = getInjectable({
  id: "setup-protocol-router-for-second-instance",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);
    const windowManager = di.inject(windowManagerInjectable);

    return {
      run: async ({ commandLineArguments }) => {
        logger.debug("second-instance message");

        for (const arg of commandLineArguments) {
          if (arg.toLowerCase().startsWith("lens://")) {
            lensProtocolRouterMain.route(arg);
          }
        }

        await windowManager.ensureMainWindow();
      },
    };
  },

  injectionToken: onSecondApplicationInstanceInjectionToken,
});

export default setupProtocolRouterForSecondInstanceInjectable;
