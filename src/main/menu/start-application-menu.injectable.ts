/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuInjectable from "./application-menu.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/when-application-is-loading-injection-token";

const startApplicationMenuInjectable = getInjectable({
  id: "start-application-menu",

  instantiate: (di) => {
    const applicationMenu = di.inject(
      applicationMenuInjectable,
    );

    return {
      run: () => {
        applicationMenu.start();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default startApplicationMenuInjectable;
