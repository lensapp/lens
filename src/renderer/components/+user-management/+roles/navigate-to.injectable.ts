/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../../common/front-end-routing/navigate-to-route-injection-token";
import rolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/roles-route.injectable";

const navigateToRolesViewInjectable = getInjectable({
  id: "navigate-to-roles-view",
  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(rolesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToRolesViewInjectable;
