/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import limitRangesRouteInjectable from "./limit-ranges-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToLimitRangesInjectable = getInjectable({
  id: "navigate-to-limit-ranges",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(limitRangesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToLimitRangesInjectable;
