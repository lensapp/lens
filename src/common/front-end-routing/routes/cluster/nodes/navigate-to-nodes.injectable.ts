/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import nodesRouteInjectable from "./nodes-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToNodesInjectable = getInjectable({
  id: "navigate-to-nodes",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(nodesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToNodesInjectable;
