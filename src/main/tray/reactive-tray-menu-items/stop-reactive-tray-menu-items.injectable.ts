/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import reactiveTrayMenuItemsInjectable from "./reactive-tray-menu-items.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const stopReactiveTrayMenuItemsInjectable = getInjectable({
  id: "stop-reactive-tray-menu-items",

  instantiate: (di) => {
    const reactiveTrayMenuItems = di.inject(reactiveTrayMenuItemsInjectable);

    return {
      id: "stop-reactive-tray-menu-items",
      run: async () => {
        await reactiveTrayMenuItems.stop();
      },
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopReactiveTrayMenuItemsInjectable;
