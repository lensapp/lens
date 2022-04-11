/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import trayInitializerInjectable from "./tray-initializer.injectable";

const setupTrayWhenApplicationIsReadyInjectable = getInjectable({
  id: "setup-tray-when-application-is-ready",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInitializerInjectable);

    return {
      run: () => {
        trayInitializer.start();
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default setupTrayWhenApplicationIsReadyInjectable;
