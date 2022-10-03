/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import broadcastThemeChangeInjectable from "./broadcast-theme-change.injectable";

const startBroadcastingThemeChangeInjectable = getInjectable({
  id: "start-broadcasting-theme-change",

  instantiate: (di) => {
    const broadcastThemeChange = di.inject(broadcastThemeChangeInjectable);

    return {
      id: "start-broadcasting-theme-change",
      run: async () => {
        await broadcastThemeChange.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startBroadcastingThemeChangeInjectable;
