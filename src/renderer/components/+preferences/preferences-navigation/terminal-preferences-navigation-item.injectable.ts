/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import terminalPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/terminal/terminal-preferences-route.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const terminalPreferencesNavigationItemInjectable = getInjectable({
  id: "terminal-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(
      navigateToPreferenceTabInjectable,
    );

    const route = di.inject(terminalPreferencesRouteInjectable);

    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return {
      id: "terminal",
      label: "Terminal",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,
      isVisible: computed(() => true),
      orderNumber: 50,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default terminalPreferencesNavigationItemInjectable;
