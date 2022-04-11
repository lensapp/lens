/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import { productName } from "../../../../common/vars";
import loggerInjectable from "../../../../common/logger.injectable";
import electronAppInjectable from "../../../app-paths/get-electron-app-path/electron-app/electron-app.injectable";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import exitAppInjectable from "../../../app-paths/get-electron-app-path/electron-app/exit-app.injectable";

const setupProtocolRouterMainInjectable = getInjectable({
  id: "setup-protocol-router-main",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const app = di.inject(electronAppInjectable);
    const exitApp = di.inject(exitAppInjectable);

    return {
      run: () => {
        logger.info(`📟 Setting ${productName} as protocol client for lens://`);

        if (app.setAsDefaultProtocolClient("lens")) {
          logger.info("📟 Protocol client register succeeded ✅");
        } else {
          logger.info("📟 Protocol client register failed ❗");
        }

        logger.debug("[APP-MAIN] Lens protocol routing main");

        const lensProtocolRouterMain = di.inject(
          lensProtocolRouterMainInjectable,
        );

        if (!app.requestSingleInstanceLock()) {
          exitApp();
        } else {
          for (const arg of process.argv) {
            if (arg.toLowerCase().startsWith("lens://")) {
              lensProtocolRouterMain.route(arg);
            }
          }
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupProtocolRouterMainInjectable;
