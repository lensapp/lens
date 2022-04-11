/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensProtocolRouterMainInjectable from "../../../protocol-handler/lens-protocol-router-main/lens-protocol-router-main.injectable";
import windowManagerInjectable from "../../../window-manager.injectable";
import { afterApplicationIsReadyInjectionToken } from "../after-application-is-ready-injection-token";
import electronAppInjectable from "../../../app-paths/get-electron-app-path/electron-app/electron-app.injectable";

const setupDeepLinking = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const lensProtocolRouterMain = di.inject(lensProtocolRouterMainInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const app = di.inject(electronAppInjectable);

    return {
      run: () => {
        app.on("open-url", async (event, url) => {
          event.preventDefault();

          await lensProtocolRouterMain.route(url);
        });

        app.on("second-instance", async (_, commandLineArguments) => {
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
