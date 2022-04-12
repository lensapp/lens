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

const setupDeepLinking = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const whenOpeningUrl = di.inject(whenOpeningUrlInjectable);
    const whenSecondInstance = di.inject(whenSecondInstanceInjectable);

    return {
      run: () => {
        whenOpeningUrl(({ cancel, url }) => {
          cancel();

          lensProtocolRouterMain.route(url);
        });

        whenSecondInstance(async ({ commandLineArguments }) => {
          for (const arg of commandLineArguments) {
            if (arg.toLowerCase().startsWith("lens://")) {
              await lensProtocolRouterMain.route(arg);
            }
          }

          await windowManager.ensureMainWindow();
        });
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupDeepLinking;
