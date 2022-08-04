/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import { runManyFor } from "../../common/runnable/run-many-for";
import { runManySyncFor } from "../../common/runnable/run-many-sync-for";
import { beforeElectronIsReadyInjectionToken } from "./runnable-tokens/before-electron-is-ready-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./runnable-tokens/before-application-is-loading-injection-token";
import { onLoadOfApplicationInjectionToken } from "./runnable-tokens/on-load-of-application-injection-token";
import { afterApplicationIsLoadedInjectionToken } from "./runnable-tokens/after-application-is-loaded-injection-token";
import splashWindowInjectable from "./lens-window/splash-window/splash-window.injectable";

import openDeepLinkInjectable from "../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import { pipeline } from "@ogre-tools/fp";
import { find, map, startsWith, toLower } from "lodash/fp";
import commandLineArgumentsInjectable from "../utils/command-line-arguments.injectable";
import waitForElectronToBeReadyInjectable from "../electron-app/features/wait-for-electron-to-be-ready.injectable";
import createFirstApplicationWindowInjectable from "./lens-window/application-window/create-first-application-window.injectable";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runManySync = runManySyncFor(di);
    const waitForElectronToBeReady = di.inject(waitForElectronToBeReadyInjectable);
    const createFirstApplicationWindow = di.inject(createFirstApplicationWindowInjectable);
    const splashWindow = di.inject(splashWindowInjectable);
    const openDeepLink = di.inject(openDeepLinkInjectable);
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    const beforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
    const beforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);
    const onLoadOfApplication = runMany(onLoadOfApplicationInjectionToken);
    const afterApplicationIsLoaded = runMany(afterApplicationIsLoadedInjectionToken);

    return (shouldStartWindow: boolean) => {
      // Stuff happening before application is ready needs to be synchronous because of
      // https://github.com/electron/electron/issues/21370
      beforeElectronIsReady();

      return (async () => {
        await waitForElectronToBeReady();

        await beforeApplicationIsLoading();

        if (shouldStartWindow) {
          await splashWindow.start();
        }

        await onLoadOfApplication();

        if (shouldStartWindow) {
          const deepLinkUrl = getDeepLinkUrl(commandLineArguments);

          if (deepLinkUrl) {
            await openDeepLink(deepLinkUrl);
          } else {
            const applicationWindow = createFirstApplicationWindow();

            await applicationWindow.start();
          }

          splashWindow.close();
        }

        await afterApplicationIsLoaded();
      })();
    };
  },
});

const getDeepLinkUrl = (commandLineArguments: string[]) =>
  pipeline(commandLineArguments, map(toLower), find(startsWith("lens://")));

export default startMainApplicationInjectable;
