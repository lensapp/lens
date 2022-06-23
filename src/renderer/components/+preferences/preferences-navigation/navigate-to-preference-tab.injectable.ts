/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Route } from "../../../../common/front-end-routing/front-end-route-injection-token";
import { navigateToRouteInjectionToken } from "../../../../common/front-end-routing/navigate-to-route-injection-token";

const navigateToPreferenceTabInjectable = getInjectable({
  id: "navigate-to-preference-tab",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);

    return (route: Route) => () => {
      navigateToRoute(route, { withoutAffectingBackButton: true });
    };
  },
});

export default navigateToPreferenceTabInjectable;
