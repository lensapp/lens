/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import extensionsPreferenceItemsInjectable from "../extension-preference-items.injectable";
import extensionPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const extensionsPreferencesNavigationItemInjectable = getInjectable({
  id: "extension-preferences-navigation-item",

  instantiate: (di) => {
    const preferenceItems = di.inject(
      extensionsPreferenceItemsInjectable,
    );

    const navigateToPreferenceTab = di.inject(
      navigateToPreferenceTabInjectable,
    );

    const route = di.inject(
      extensionPreferencesRouteInjectable,
    );

    const routeIsActive = di.inject(
      routeIsActiveInjectable,
      route,
    );

    return {
      id: "extensions",
      label: "Extensions",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,

      isVisible: computed(
        () => preferenceItems.get().length > 0,
      ),

      orderNumber: 70,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default extensionsPreferencesNavigationItemInjectable;
