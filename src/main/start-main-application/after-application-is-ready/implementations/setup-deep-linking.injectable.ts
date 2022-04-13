/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import whenOpeningUrlInjectable from "../../../electron-app/when-opening-url.injectable";
import whenSecondInstanceInjectable from "../../../electron-app/when-second-instance.injectable";
import loggerInjectable from "../../../../common/logger.injectable";
import electronAppInjectable from "../../../electron-app/electron-app.injectable";
import type { LensProtocolRouterMain } from "../../../protocol-handler";
import { pipeline } from "@ogre-tools/fp";
import { find, map, startsWith, toLower } from "lodash/fp";

const setupDeepLinkingInjectable = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const whenOpeningUrl = di.inject(whenOpeningUrlInjectable);
    const whenSecondInstance = di.inject(whenSecondInstanceInjectable);
    const logger = di.inject(loggerInjectable);
    const app = di.inject(electronAppInjectable);
    const protocolRouter = di.inject(lensProtocolRouterMainInjectable);
    const routeWithProtocolRouter = routeWithProtocolRouterFor(protocolRouter);

    return {
      run: async () => {
        whenOpeningUrl(async ({ cancel, url }) => {
          cancel();

          await protocolRouter.route(url);
        });

        whenSecondInstance(async ({ commandLineArguments }) => {
          await routeWithProtocolRouter(commandLineArguments);
          await windowManager.ensureMainWindow();
        });

        logger.info(`📟 Setting protocol client for lens://`);

        if (app.setAsDefaultProtocolClient("lens")) {
          logger.info("📟 Protocol client register succeeded ✅");
        } else {
          logger.info("📟 Protocol client register failed ❗");
        }

        await routeWithProtocolRouter(process.argv);
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

const routeWithProtocolRouterFor =
  (protocolRouter: LensProtocolRouterMain) =>
    async (commandLineArguments: string[]) => {
      const route = pipeline(
        commandLineArguments,
        map(toLower),
        find(startsWith("lens://")),
      );

      if (route) {
        await protocolRouter.route(route);
      }
    };

export default setupDeepLinkingInjectable;
