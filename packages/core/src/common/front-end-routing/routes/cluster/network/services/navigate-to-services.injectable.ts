/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import servicesRouteInjectable from "./services-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToServicesInjectable = getInjectable({
  id: "navigate-to-services",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(servicesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToServicesInjectable;
