/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import editorPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/editor/editor-preferences-route.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const editorPreferencesNavigationItemInjectable = getInjectable({
  id: "editor-preferences-navigation-item",

  instantiate: (di) => {
    const route = di.inject(editorPreferencesRouteInjectable);
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);

    const routeIsActive = di.inject(
      routeIsActiveInjectable,
      route,
    );

    return {
      id: "editor",
      label: "Editor",
      parent: "general",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,
      isVisible: computed(() => true),
      orderNumber: 40,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default editorPreferencesNavigationItemInjectable;
