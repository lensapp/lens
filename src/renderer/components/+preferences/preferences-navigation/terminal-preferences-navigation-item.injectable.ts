/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import { computed } from "mobx";
import navigateToPreferenceTabInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import preferenceTabIsActiveInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/preference-tab-is-active.injectable";

const terminalPreferencesNavigationItemInjectable = getInjectable({
  id: "terminal-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "terminal");

    return {
      id: "terminal",
      label: "Terminal",
      parent: "general",
      navigate: () => navigateToPreferenceTab("terminal"),
      isActive: preferenceTabIsActive,
      isVisible: computed(() => true),
      orderNumber: 50,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default terminalPreferencesNavigationItemInjectable;
