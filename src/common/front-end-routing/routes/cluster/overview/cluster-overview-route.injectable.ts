/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../utils/is-allowed-resource.injectable";
import { routeInjectionToken } from "../../../route-injection-token";

const clusterOverviewRouteInjectable = getInjectable({
  id: "cluster-overview-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable, "nodes");

    return {
      path: "/overview",
      clusterFrame: true,
      isEnabled: isAllowedResource,
    };
  },

  injectionToken: routeInjectionToken,
});

export default clusterOverviewRouteInjectable;
