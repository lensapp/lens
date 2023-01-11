/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import roleBindingsRouteInjectable from "./role-bindings-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToRoleBindingsInjectable = getInjectable({
  id: "navigate-to-role-bindings",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(roleBindingsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToRoleBindingsInjectable;
