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
import { getStartableStoppable } from "../../common/utils/get-startable-stoppable";
import isAutoUpdateEnabledInjectable from "../is-auto-update-enabled.injectable";
import trayIconPathInjectable from "./tray-icon-path.injectable";

const trayInjectable = getInjectable({
  id: "tray",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const trayMenuItems = di.inject(trayMenuItemsInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);
    const isAutoUpdateEnabled = di.inject(isAutoUpdateEnabledInjectable);
    const trayIconPath = di.inject(trayIconPathInjectable);

    return getStartableStoppable("build-of-tray", () =>
      initTray(
        windowManager,
        trayMenuItems,
        navigateToPreferences,
        stopServicesAndExitApp,
        isAutoUpdateEnabled,
        trayIconPath,
      ),
    );
  },
});

export default trayInjectable;
