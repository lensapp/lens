/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInjectable from "./tray.injectable";
import { whenApplicationIsLoadingInjectionToken } from "../start-main-application/runnable-tokens/when-application-is-loading-injection-token";

const startTrayInjectable = getInjectable({
  id: "start-tray",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInjectable);

    return {
      run: async () => {
        await trayInitializer.start();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default startTrayInjectable;
