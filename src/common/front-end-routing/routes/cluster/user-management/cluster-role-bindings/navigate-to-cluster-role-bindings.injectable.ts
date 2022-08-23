/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterRoleBindingsRouteInjectable from "./cluster-role-bindings-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToClusterRoleBindingsInjectable = getInjectable({
  id: "navigate-to-cluster-role-bindings",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(clusterRoleBindingsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToClusterRoleBindingsInjectable;
