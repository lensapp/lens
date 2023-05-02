/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import openDeepLinkInjectable from "../../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";
import { startsWith, toLower } from "lodash/fp";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";

const setupDeepLinkingInjectable = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => ({
    run: async () => {
      const app = di.inject(electronAppInjectable);
      const logger = di.inject(loggerInjectionToken);
      const openDeepLinkForUrl = di.inject(openDeepLinkInjectable);
      const showApplicationWindow = di.inject(showApplicationWindowInjectable);
      const firstInstanceCommandLineArguments = di.inject(commandLineArgumentsInjectable);

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
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupDeepLinkingInjectable;

const getDeepLinkUrl = (commandLineArguments: string[]) => (
  commandLineArguments
    .map(toLower)
    .find(startsWith("lens://"))
);
