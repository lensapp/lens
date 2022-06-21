/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import proxyPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/proxy/proxy-preferences-route.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const proxyPreferencesNavigationItemInjectable = getInjectable({
  id: "proxy-preferences-navigation-item",

  instantiate: (di) => {
    const route = di.inject(proxyPreferencesRouteInjectable);

    const navigateToPreferenceTab = di.inject(
      navigateToPreferenceTabInjectable,
    );

    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return {
      id: "proxy",
      label: "Proxy",
      parent: "general",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,
      isVisible: computed(() => true),
      orderNumber: 20,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default proxyPreferencesNavigationItemInjectable;
