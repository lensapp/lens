/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import broadcastThemeChangeInjectable from "./broadcast-theme-change.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopBroadcastingThemeChangeInjectable = getInjectable({
  id: "stop-broadcasting-theme-change",

  instantiate: (di) => {
    const broadcastThemeChange = di.inject(broadcastThemeChangeInjectable);

    return {
      run: async () => {
        await broadcastThemeChange.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopBroadcastingThemeChangeInjectable;
