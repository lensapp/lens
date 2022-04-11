/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import applicationMenuInjectable from "./application-menu.injectable";

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

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default startApplicationMenuInjectable;
