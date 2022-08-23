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
import sentryDnsUrlInjectable from "../sentry-dns-url.injectable";
import navigateToPreferenceTabInjectable from "./navigate-to-preference-tab.injectable";

const terminalPreferencesNavigationItemInjectable = getInjectable({
  id: "telemetry-preferences-navigation-item",

  instantiate: (di) => {
    const sentryDnsUrl = di.inject(sentryDnsUrlInjectable);

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
        () => !!sentryDnsUrl || telemetryPreferenceItems.get().length > 0,
      ),

      orderNumber: 60,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default terminalPreferencesNavigationItemInjectable;
