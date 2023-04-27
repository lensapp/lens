/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import replicationControllersRouteInjectable from "./route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToReplicationControllersInjectable = getInjectable({
  id: "navigate-to-replicationcontrollers",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(replicationControllersRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToReplicationControllersInjectable;
