/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import statefulsetsRouteInjectable from "./statefulsets-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToStatefulsetsInjectable = getInjectable({
  id: "navigate-to-statefulsets",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(statefulsetsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToStatefulsetsInjectable;
