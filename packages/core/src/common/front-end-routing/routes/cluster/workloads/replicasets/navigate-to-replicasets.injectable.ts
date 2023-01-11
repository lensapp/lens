/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import replicasetsRouteInjectable from "./replicasets-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToReplicasetsInjectable = getInjectable({
  id: "navigate-to-replicasets",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(replicasetsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToReplicasetsInjectable;
