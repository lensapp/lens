/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import openDeepLinkInjectable from "../../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { afterApplicationIsReadyInjectionToken } from "../../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";
import { pipeline } from "@ogre-tools/fp";
import { find, startsWith, toLower, map } from "lodash/fp";
import ensureMainWindowInjectable from "../../ensure-main-window/ensure-main-window.injectable";
import enforceSingleApplicationInstanceInjectable from "./enforce-single-application-instance.injectable";

const setupDeepLinkingInjectable = getInjectable({
  id: "setup-deep-linking",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const logger = di.inject(loggerInjectable);
    const openDeepLinkForUrl = di.inject(openDeepLinkInjectable);

    const firstInstanceCommandLineArguments = di.inject(
      commandLineArgumentsInjectable,
    );

    const ensureMainWindow = di.inject(ensureMainWindowInjectable);

    return {
      runAfter: di.inject(enforceSingleApplicationInstanceInjectable),

      run: async () => {
        {
          logger.info(`📟 Setting protocol client for lens://`);

          if (app.setAsDefaultProtocolClient("lens")) {
            logger.info("📟 Protocol client register succeeded ✅");
          } else {
            logger.info("📟 Protocol client register failed ❗");
          }

          app.on("open-url", async (event, url) => {
            event.preventDefault();

            await openDeepLinkForUrl(url);
          });

          app.on(
            "second-instance",

            async (_, secondInstanceCommandLineArguments) => {
              const url = getDeepLinkUrl(secondInstanceCommandLineArguments);

              await ensureMainWindow();

              if (url) {
                await openDeepLinkForUrl(url);
              }
            },
          );

          const url = getDeepLinkUrl(firstInstanceCommandLineArguments);

          if (url) {
            await openDeepLinkForUrl(url);
          }
        }
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupDeepLinkingInjectable;

const getDeepLinkUrl = (commandLineArguments: string[]) =>
  pipeline(commandLineArguments, map(toLower), find(startsWith("lens://")));
