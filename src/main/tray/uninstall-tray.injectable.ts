/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInjectable from "./tray.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const uninstallTrayInjectable = getInjectable({
  id: "uninstall-tray",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInjectable);

    return {
      run: async () => {
        await trayInitializer.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default uninstallTrayInjectable;
