/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterApplicationIsReadyInjectionToken } from "../start-main-application/after-application-is-ready/after-application-is-ready-injection-token";
import trayInjectable from "./tray.injectable";

const startTrayInjectable = getInjectable({
  id: "start-tray",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInjectable);

    return {
      run: () => {
        trayInitializer.start();
      },
    };
  },

  injectionToken: afterApplicationIsReadyInjectionToken,
});

export default startTrayInjectable;
