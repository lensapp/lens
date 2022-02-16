/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../../utils/is-allowed-resource.injectable";
import { routeInjectionToken } from "../../../../route-injection-token";

const servicesRouteInjectable = getInjectable({
  id: "services-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable, "services");

    return {
      path: "/services",
      clusterFrame: true,
      isEnabled: isAllowedResource,
    };
  },

  injectionToken: routeInjectionToken,
});

export default servicesRouteInjectable;
