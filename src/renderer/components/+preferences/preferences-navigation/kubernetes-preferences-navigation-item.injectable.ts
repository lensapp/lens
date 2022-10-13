/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import { computed } from "mobx";
import preferenceTabIsActiveInjectable from "./navigate-to-preference-tab/preference-tab-is-active.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab/navigate-to-preference-tab.injectable";

const kubernetesPreferencesNavigationItemInjectable = getInjectable({
  id: "kubernetes-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "kubernetes");

    return {
      id: "kubernetes",
      label: "Kubernetes",
      parent: "general",
      navigate: () => navigateToPreferenceTab("kubernetes"),
      isActive: preferenceTabIsActive,
      isVisible: computed(() => true),
      orderNumber: 30,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default kubernetesPreferencesNavigationItemInjectable;
