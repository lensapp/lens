/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import podsRouteInjectable from "./pods-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToPodsInjectable = getInjectable({
  id: "navigate-to-pods",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(podsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToPodsInjectable;
