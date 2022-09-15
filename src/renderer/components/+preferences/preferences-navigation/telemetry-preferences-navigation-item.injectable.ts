/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { computed } from "mobx";
import telemetryPreferenceItemsInjectable from "../telemetry-preference-items.injectable";
import telemetryPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/telemetry/telemetry-preferences-route.injectable";
import sentryDataSourceNameInjectable from "../../../../common/vars/sentry-dsn-url.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const terminalPreferencesNavigationItemInjectable = getInjectable({
  id: "telemetry-preferences-navigation-item",

  instantiate: (di) => {
    const sentryDataSourceName = di.inject(sentryDataSourceNameInjectable);

    const telemetryPreferenceItems = di.inject(
      telemetryPreferenceItemsInjectable,
    );

    const navigateToPreferenceTab = di.inject(
      navigateToPreferenceTabInjectable,
    );

    const route = di.inject(telemetryPreferencesRouteInjectable);

    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return {
      id: "telemetry",
      label: "Telemetry",
      parent: "general",
      navigate: navigateToPreferenceTab(route),
      isActive: routeIsActive,

      isVisible: computed(
        () => !!sentryDataSourceName || telemetryPreferenceItems.get().length > 0,
      ),

      orderNumber: 60,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default terminalPreferencesNavigationItemInjectable;
