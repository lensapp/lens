/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { whenApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/when-application-is-loading-injection-token";
import broadcastThemeChangeInjectable from "./broadcast-theme-change.injectable";

const startBroadcastingThemeChangeInjectable = getInjectable({
  id: "start-broadcasting-theme-change",

  instantiate: (di) => {
    const broadcastThemeChange = di.inject(broadcastThemeChangeInjectable);

    return {
      run: async () => {
        await broadcastThemeChange.start();
      },
    };
  },

  injectionToken: whenApplicationIsLoadingInjectionToken,
});

export default startBroadcastingThemeChangeInjectable;
