/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import trayInitializerInjectable from "./tray-initializer.injectable";
import { onApplicationQuitInjectionToken } from "../start-main-application/on-application-quit/on-application-quit-injection-token";

const setupTrayWhenApplicationIsQuitInjectable = getInjectable({
  id: "setup-tray-when-application-is-quit",

  instantiate: (di) => {
    const trayInitializer = di.inject(trayInitializerInjectable);

    return {
      run: () => {
        trayInitializer.stop();
      },
    };
  },

  injectionToken: onApplicationQuitInjectionToken,
});

export default setupTrayWhenApplicationIsQuitInjectable;
