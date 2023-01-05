/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addClusterRouteInjectable from "./add-cluster-route.injectable";
import { navigateToRouteInjectionToken } from "../../navigate-to-route-injection-token";

const navigateToAddClusterInjectable = getInjectable({
  id: "navigate-to-add-cluster",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(addClusterRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToAddClusterInjectable;
