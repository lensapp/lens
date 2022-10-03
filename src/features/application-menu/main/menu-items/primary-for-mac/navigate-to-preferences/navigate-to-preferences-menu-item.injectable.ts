/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToPreferencesInjectable from "../../../../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";

const navigateToPreferencesMenuItem = getInjectable({
  id: "navigate-to-preferences-menu-item",

  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);

    return {
      parentId: "primary-for-mac",
      id: "navigate-to-preferences",
      orderNumber: 40,
      label: "Preferences",
      accelerator: "CmdOrCtrl+,",

      click: () => {
        navigateToPreferences();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToPreferencesMenuItem;
