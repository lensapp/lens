/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuInitializerInjectable from "./application-menu-initializer.injectable";
import { onApplicationHardQuitInjectionToken } from "../start-main-application/on-application-hard-quit/on-application-hard-quit-injection-token";

const cleanupApplicationMenuWhenApplicationIsQuitInjectable = getInjectable({
  id: "cleanup-application-menu-when-application-is-quit",

  instantiate: (di) => {
    const initializeApplicationMenu = di.inject(
      applicationMenuInitializerInjectable,
    );

    return {
      run: () => {
        initializeApplicationMenu.stop();
      },
    };
  },

  injectionToken: onApplicationHardQuitInjectionToken,
});

export default cleanupApplicationMenuWhenApplicationIsQuitInjectable;
