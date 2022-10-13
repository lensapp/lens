/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import { computed } from "mobx";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import preferenceTabIsActiveInjectable from "./navigate-to-preference-tab/preference-tab-is-active.injectable";

const applicationPreferencesNavigationItemInjectable = getInjectable({
  id: "application-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "app");

    return {
      id: "application",
      label: "App",
      parent: "general",
      navigate: () => navigateToPreferenceTab("app"),
      isActive: preferenceTabIsActive,
      isVisible: computed(() => true),
      orderNumber: 10,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default applicationPreferencesNavigationItemInjectable;
