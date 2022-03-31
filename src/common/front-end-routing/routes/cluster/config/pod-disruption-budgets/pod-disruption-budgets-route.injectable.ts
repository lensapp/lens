/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../../utils/is-allowed-resource.injectable";
import { routeInjectionToken } from "../../../../route-injection-token";

const podDisruptionBudgetsRouteInjectable = getInjectable({
  id: "pod-disruption-budgets-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable, "poddisruptionbudgets");

    return {
      path: "/poddisruptionbudgets",
      clusterFrame: true,
      isEnabled: isAllowedResource,
    };
  },

  injectionToken: routeInjectionToken,
});

export default podDisruptionBudgetsRouteInjectable;
