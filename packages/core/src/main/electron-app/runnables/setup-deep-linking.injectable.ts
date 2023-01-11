/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import openDeepLinkInjectable from "../../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";
import { pipeline } from "@ogre-tools/fp";
import { find, startsWith, toLower, map } from "lodash/fp";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";

const setupDeepLinkingInjectable = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const logger = di.inject(loggerInjectable);
    const openDeepLinkForUrl = di.inject(openDeepLinkInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    const firstInstanceCommandLineArguments = di.inject(
      commandLineArgumentsInjectable,
    );

    return {
      id: "setup-deep-linking",
      run: async () => {
        logger.info(`📟 Setting protocol client for lens://`);

        if (app.setAsDefaultProtocolClient("lens")) {
          logger.info("📟 Protocol client register succeeded ✅");
        } else {
          logger.info("📟 Protocol client register failed ❗");
        }

        const url = getDeepLinkUrl(firstInstanceCommandLineArguments);

        if (url) {
          await openDeepLinkForUrl(url);
        }

        app.on("open-url", async (event, url) => {
          event.preventDefault();

          await openDeepLinkForUrl(url);
        });

        app.on(
          "second-instance",

          async (_, secondInstanceCommandLineArguments) => {
            const url = getDeepLinkUrl(secondInstanceCommandLineArguments);

            await showApplicationWindow();

            if (url) {
              await openDeepLinkForUrl(url);
            }
          },
        );
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDeepLinkingInjectable;

const getDeepLinkUrl = (commandLineArguments: string[]) =>
  pipeline(commandLineArguments, map(toLower), find(startsWith("lens://")));
