/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import preferenceNavigationItemsInjectable from "../components/+preferences/preferences-navigation/preference-navigation-items.injectable";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";

const navigateToPreferenceTabIdInjectable = getInjectable({
  id: "navigate-to-preference-tab-id",

  instantiate: (di) => {
    const preferenceNavigationItems = di.inject(preferenceNavigationItemsInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);

    return (tabId: string) => {
      const targetTab = preferenceNavigationItems.get().find(item => item.id === tabId);

      if (targetTab) {
        targetTab.navigate();

        return;
      }

      navigateToPreferences();
    };
  },
});

export default navigateToPreferenceTabIdInjectable;
