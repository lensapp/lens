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
import type { LensProtocolRouterMain } from "../../../protocol-handler";
import { pipeline } from "@ogre-tools/fp";
import { find, map, startsWith, toLower } from "lodash/fp";
import registerProtocolClientInjectable from "../../../electron-app/register-protocol-client.injectable";
import commandLineArgumentsInjectable from "../../../utils/command-line-arguments.injectable";

const setupDeepLinkingInjectable = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const whenOpeningUrl = di.inject(whenOpeningUrlInjectable);
    const whenSecondInstance = di.inject(whenSecondInstanceInjectable);
    const protocolRouter = di.inject(lensProtocolRouterMainInjectable);
    const routeWithProtocolRouter = routeWithProtocolRouterFor(protocolRouter);
    const registerProtocolClient = di.inject(registerProtocolClientInjectable);
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    return {
      run: async () => {
        whenOpeningUrl(async ({ cancel, url }) => {
          cancel();

          await protocolRouter.route(url);
        });

        whenSecondInstance(async ({ commandLineArguments: secondInstanceArguments }) => {
          await routeWithProtocolRouter(secondInstanceArguments);
          await windowManager.ensureMainWindow();
        });

        registerProtocolClient("lens");

        await routeWithProtocolRouter(commandLineArguments);
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
