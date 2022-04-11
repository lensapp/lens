/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import applicationMenuInitializerInjectable from "./application-menu-initializer.injectable";

const setupApplicationMenuWhenApplicationIsReadyInjectable = getInjectable({
  id: "setup-application-menu-when-application-is-ready",

  instantiate: (di) => {
    const initializeApplicationMenu = di.inject(
      applicationMenuInitializerInjectable,
    );

    return {
      run: () => {
        initializeApplicationMenu.start();
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupApplicationMenuWhenApplicationIsReadyInjectable;
