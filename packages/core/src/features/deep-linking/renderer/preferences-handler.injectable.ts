/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToPreferencesInjectable from "../../preferences/common/navigate-to-preferences.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const preferencesDeepLinkHandlerInjectable = getInjectable({
  id: "preferences-deep-link-handler",
  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);

    return {
      path: "/preferences",
      handler: ({ search: { highlight: tabId }}) => {
        if (tabId) {
          navigateToPreferences(tabId);
        }
      },
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default preferencesDeepLinkHandlerInjectable;
