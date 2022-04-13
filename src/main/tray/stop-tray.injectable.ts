/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInjectable from "./tray.injectable";
import { beforeApplicationHardQuitInjectionToken } from "../start-main-application/before-application-hard-quit/before-application-hard-quit-injection-token";

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

  injectionToken: beforeApplicationHardQuitInjectionToken,
});

export default stopTrayInjectable;
