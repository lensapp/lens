/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";
import { computed } from "mobx";
import telemetryPreferenceItemsInjectable from "../telemetry-preference-items.injectable";
import sentryDataSourceNameInjectable from "../../../../common/vars/sentry-dsn-url.injectable";
import navigateToPreferenceTabInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/navigate-to-preference-tab.injectable";
import preferenceTabIsActiveInjectable from "../../../../features/preferences/renderer/preference-navigation/navigate-to-preference-tab/preference-tab-is-active.injectable";

const terminalPreferencesNavigationItemInjectable = getInjectable({
  id: "telemetry-preferences-navigation-item",

  instantiate: (di) => {
    const sentryDataSourceName = di.inject(sentryDataSourceNameInjectable);
    const telemetryPreferenceItems = di.inject(telemetryPreferenceItemsInjectable);
    const navigateToPreferenceTab = di.inject(navigateToPreferenceTabInjectable);
    const preferenceTabIsActive = di.inject(preferenceTabIsActiveInjectable, "telemetry");

    return {
      id: "telemetry",
      label: "Telemetry",
      parent: "general",
      navigate: () => navigateToPreferenceTab("telemetry"),
      isActive: preferenceTabIsActive,

      isVisible: computed(
        () => !!sentryDataSourceName || telemetryPreferenceItems.get().length > 0,
      ),

      orderNumber: 60,
    };
  },

  injectionToken: preferenceNavigationItemInjectionToken,
});

export default terminalPreferencesNavigationItemInjectable;
