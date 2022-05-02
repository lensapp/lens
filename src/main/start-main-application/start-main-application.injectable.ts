/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import electronAppInjectable from "../electron-app/electron-app.injectable";
import { runManyFor } from "./run-many-for";
import { runManySyncFor } from "./run-many-sync-for";
import { beforeElectronIsReadyInjectionToken } from "./before-electron-is-ready/before-electron-is-ready-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./before-application-is-loading/before-application-is-loading-injection-token";
import { whenApplicationIsLoadingInjectionToken } from "./when-application-is-loading/when-application-is-loading-injection-token";
import { afterApplicationIsLoadedInjectionToken } from "./after-application-is-loaded/after-application-is-loaded-injection-token";
import applicationIsLoadingWindowInjectable from "./lens-window/application-is-loading-window/application-is-loading-window.injectable";

import applicationWindowInjectable from "./lens-window/application-window/application-window.injectable";
import shouldStartHiddenInjectable from "../electron-app/features/should-start-hidden.injectable";
import openDeepLinkInjectable from "../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import { pipeline } from "@ogre-tools/fp";
import { find, map, startsWith, toLower } from "lodash/fp";
import commandLineArgumentsInjectable from "../utils/command-line-arguments.injectable";

const startMainApplicationInjectable = getInjectable({
  id: "start-main-application",

  instantiate: (di) => {
    const runMany = runManyFor(di);
    const runManySync = runManySyncFor(di);
    const electronApp = di.inject(electronAppInjectable);
    const applicationWindow = di.inject(applicationWindowInjectable);
    const applicationIsLoadingWindow = di.inject(applicationIsLoadingWindowInjectable);
    const shouldStartHidden = di.inject(shouldStartHiddenInjectable);
    const openDeepLink = di.inject(openDeepLinkInjectable);
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    const beforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
    const beforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);
    const whenApplicationIsLoading = runMany(whenApplicationIsLoadingInjectionToken);
    const afterApplicationIsLoaded = runMany(afterApplicationIsLoadedInjectionToken);

    return async () => {
      // Stuff happening before application is ready needs to be synchronous because of
      // https://github.com/electron/electron/issues/21370
      beforeElectronIsReady();

      await electronApp.whenReady();

      await beforeApplicationIsLoading();

      if (!shouldStartHidden) {
        await applicationIsLoadingWindow.show();
      }

      await whenApplicationIsLoading();

      if (!shouldStartHidden) {
        const url = getDeepLinkUrl(commandLineArguments);

        if (url) {
          await openDeepLink(url);
        } else {
          await applicationWindow.show();
        }

        applicationIsLoadingWindow.close();
      }

      await afterApplicationIsLoaded();
    };
  },
});

const getDeepLinkUrl = (commandLineArguments: string[]) =>
  pipeline(commandLineArguments, map(toLower), find(startsWith("lens://")));


export default startMainApplicationInjectable;
