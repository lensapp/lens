/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import { computed } from "mobx";
import preferenceTabIsActiveInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/preference-tab-is-active.injectable";
import navigateToPreferenceTabInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/navigate-to-preference-tab.injectable";

const editorPreferencesNavigationItemInjectable = getInjectable({
  id: "editor-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "editor");

    return {
      id: "editor",
      label: "Editor",
      parent: "general",
      navigate: () => navigateToPreferenceTab("editor"),
      isActive: preferenceTabIsActive,
      isVisible: computed(() => true),
      orderNumber: 40,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default editorPreferencesNavigationItemInjectable;
