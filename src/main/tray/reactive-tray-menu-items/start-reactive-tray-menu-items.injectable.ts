/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import reactiveTrayMenuItemsInjectable from "./reactive-tray-menu-items.injectable";
import { onLoadOfApplicationInjectionToken } from "../../start-main-application/runnable-tokens/on-load-of-application-injection-token";
import startTrayInjectable from "../electron-tray/start-tray.injectable";

const startReactiveTrayMenuItemsInjectable = getInjectable({
  id: "start-reactive-tray-menu-items",

  instantiate: (di) => {
    const reactiveTrayMenuItems = di.inject(reactiveTrayMenuItemsInjectable);

    return {
      run: async () => {
        await reactiveTrayMenuItems.start();
      },

      runAfter: di.inject(startTrayInjectable),
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default startReactiveTrayMenuItemsInjectable;
