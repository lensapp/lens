/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import appPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/app/app-preferences-route.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const applicationPreferencesNavigationItemInjectable = getInjectable({
  id: "application-preferences-navigation-item",

  instantiate: (di) => {
    const route = di.inject(appPreferencesRouteInjectable);
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);

    const routeIsActive = di.inject(
      routeIsActiveInjectable,
      route,
    );

    return {
      id: "application",
      label: "App",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,
      isVisible: computed(() => true),
      orderNumber: 10,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default applicationPreferencesNavigationItemInjectable;
