/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import electronTrayInjectable from "./electron-tray.injectable";

const startTrayInjectable = getInjectable({
  id: "start-tray",

  instantiate: (di) => {
    const electronTray = di.inject(electronTrayInjectable);

    return {
      run: () => {
        electronTray.start();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startTrayInjectable;
