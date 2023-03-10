/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import shouldStartHiddenInjectable from "../../electron-app/features/should-start-hidden.injectable";
import openDeepLinkInjectable from "../../protocol-handler/lens-protocol-router-main/open-deep-link-for-url/open-deep-link.injectable";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";
import createFirstApplicationWindowInjectable from "../lens-window/application-window/create-first-application-window.injectable";
import splashWindowInjectable from "../lens-window/splash-window/splash-window.injectable";
import { afterApplicationIsLoadedInjectionToken } from "@k8slens/application";

const getDeepLinkUrl = (commandLineArguments: string[]) => (
  commandLineArguments
    .map(arg => arg.toLowerCase())
    .find(arg => arg.startsWith("lens://"))
);

const showInitialWindowInjectable = getInjectable({
  id: "show-initial-window",
  instantiate: (di) => ({
    run: async () => {
      const shouldStartHidden = di.inject(shouldStartHiddenInjectable);
      const shouldStartWindow = !shouldStartHidden;
      const createFirstApplicationWindow = di.inject(createFirstApplicationWindowInjectable);
      const splashWindow = di.inject(splashWindowInjectable);
      const openDeepLink = di.inject(openDeepLinkInjectable);
      const commandLineArguments = di.inject(commandLineArgumentsInjectable);

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
    },
  }),
  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default showInitialWindowInjectable;
