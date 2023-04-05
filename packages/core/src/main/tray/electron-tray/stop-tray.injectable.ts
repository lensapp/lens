/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronTrayInjectable from "./electron-tray.injectable";
import { onQuitOfBackEndInjectionToken } from "../../start-main-application/runnable-tokens/phases";
import stopReactiveTrayMenuItemsInjectable from "../reactive-tray-menu-items/stop-reactive-tray-menu-items.injectable";

const stopTrayInjectable = getInjectable({
  id: "stop-tray",

  instantiate: (di) => ({
    run: () => {
      const electronTray = di.inject(electronTrayInjectable);

      electronTray.stop();

      return undefined;
    },
    runAfter: stopReactiveTrayMenuItemsInjectable,
  }),

  injectionToken: onQuitOfBackEndInjectionToken,
});

export default stopTrayInjectable;
