/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterRolesRouteInjectable from "./cluster-roles-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToClusterRolesInjectable = getInjectable({
  id: "navigate-to-cluster-roles",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(clusterRolesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToClusterRolesInjectable;
