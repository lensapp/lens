/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import welcomeRouteInjectable from "./welcome-route.injectable";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";

const navigateToWelcomeInjectable = getInjectable({
  id: "navigate-to-welcome",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(welcomeRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToWelcomeInjectable;
