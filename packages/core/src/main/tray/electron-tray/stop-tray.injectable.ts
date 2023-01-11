/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronTrayInjectable from "./electron-tray.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";
import stopReactiveTrayMenuItemsInjectable from "../reactive-tray-menu-items/stop-reactive-tray-menu-items.injectable";

const stopTrayInjectable = getInjectable({
  id: "stop-tray",

  instantiate: (di) => {
    const electronTray = di.inject(electronTrayInjectable);

    return {
      id: "stop-tray",
      run: () => void electronTray.stop(),
      runAfter: di.inject(stopReactiveTrayMenuItemsInjectable),
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default stopTrayInjectable;
