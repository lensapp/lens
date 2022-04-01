/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import kubernetesPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/kubernetes/kubernetes-preferences-route.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const kubernetesPreferencesNavigationItemInjectable = getInjectable({
  id: "kubernetes-preferences-navigation-item",

  instantiate: (di) => {
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);

    const route = di.inject(
      kubernetesPreferencesRouteInjectable,
    );

    const routeIsActive = di.inject(
      routeIsActiveInjectable,
      route,
    );

    return {
      id: "kubernetes",
      label: "Kubernetes",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,
      isVisible: computed(() => true),
      orderNumber: 30,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default kubernetesPreferencesNavigationItemInjectable;
