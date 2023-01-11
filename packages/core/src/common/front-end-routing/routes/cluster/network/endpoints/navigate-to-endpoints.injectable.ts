/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import endpointsRouteInjectable from "./endpoints-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToEndpointsInjectable = getInjectable({
  id: "navigate-to-endpoints",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(endpointsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToEndpointsInjectable;
