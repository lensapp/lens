/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import reactiveTrayMenuItemsInjectable from "./reactive-tray-menu-items.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";

const stopReactiveTrayMenuItemsInjectable = getInjectable({
  id: "stop-reactive-tray-menu-items",

  instantiate: (di) => ({
    run: () => {
      const reactiveTrayMenuItems = di.inject(reactiveTrayMenuItemsInjectable);

      reactiveTrayMenuItems.stop();

      return undefined;
    },
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopReactiveTrayMenuItemsInjectable;
