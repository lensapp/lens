/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import daemonsetsRouteInjectable from "./daemonsets-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToDaemonsetsInjectable = getInjectable({
  id: "navigate-to-daemonsets",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(daemonsetsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToDaemonsetsInjectable;
