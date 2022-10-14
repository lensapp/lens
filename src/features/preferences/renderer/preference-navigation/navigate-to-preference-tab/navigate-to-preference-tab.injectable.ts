/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../../../common/front-end-routing/navigate-to-route-injection-token";
import preferencesRouteInjectable from "../../../common/preferences-route.injectable";

const navigateToPreferenceTabInjectable = getInjectable({
  id: "navigate-to-preference-tab-2",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(preferencesRouteInjectable);

    return (preferenceTabId: string) => {
      navigateToRoute(route, {
        withoutAffectingBackButton: true,
        parameters: { preferenceTabId },
      });
    };
  },
});

export default navigateToPreferenceTabInjectable;
