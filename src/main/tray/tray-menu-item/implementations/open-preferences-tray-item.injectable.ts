/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import navigateToPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import { computed } from "mobx";

const openPreferencesTrayItemInjectable = getInjectable({
  id: "open-preferences-tray-item",

  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);

    return {
      id: "open-preferences",
      parentId: null,
      label: computed(() => "Preferences"),
      orderNumber: 20,
      enabled: computed(() => true),
      visible: computed(() => true),

      click: () => {
        navigateToPreferences();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default openPreferencesTrayItemInjectable;
