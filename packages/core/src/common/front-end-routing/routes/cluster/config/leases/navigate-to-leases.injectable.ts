/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import leasesRouteInjectable from "./leases-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToLeasesInjectable = getInjectable({
  id: "navigate-to-leases",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(leasesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToLeasesInjectable;
