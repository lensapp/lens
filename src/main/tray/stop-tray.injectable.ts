/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInjectable from "./tray.injectable";
import { onApplicationHardQuitInjectionToken } from "../start-main-application/on-application-hard-quit/on-application-hard-quit-injection-token";

const stopTrayInjectable = getInjectable({
  id: "stop-tray",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInjectable);

    return {
      run: () => {
        trayInitializer.stop();
      },
    };
  },

  injectionToken: onApplicationHardQuitInjectionToken,
});

export default stopTrayInjectable;
