/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rolesRouteInjectable from "./roles-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToRolesInjectable = getInjectable({
  id: "navigate-to-roles",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(rolesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToRolesInjectable;
