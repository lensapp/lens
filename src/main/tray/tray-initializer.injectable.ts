/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initTray } from "./tray";
import windowManagerInjectable from "../window-manager.injectable";
import trayMenuItemsInjectable from "./tray-menu-items.injectable";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import stopServicesAndExitAppInjectable from "../stop-services-and-exit-app.injectable";

const trayInitializerInjectable = getInjectable({
  id: "tray-initializer",

  instantiate: (di) => {
    let disposer: () => void;

    return ({
      start: () => {
        const windowManager = di.inject(windowManagerInjectable);
        const trayMenuItems = di.inject(trayMenuItemsInjectable);
        const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
        const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);

        disposer = initTray(windowManager, trayMenuItems, navigateToPreferences, stopServicesAndExitApp);
      },

      stop: () => disposer?.(),
    });
  },
});

export default trayInitializerInjectable;
