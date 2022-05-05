/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInjectable from "./tray.injectable";
import { onLoadOfApplicationInjectionToken } from "../start-main-application/runnable-tokens/on-load-of-application-injection-token";

const installTrayInjectable = getInjectable({
  id: "install-tray",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInjectable);

    return {
      run: async () => {
        await trayInitializer.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default installTrayInjectable;
