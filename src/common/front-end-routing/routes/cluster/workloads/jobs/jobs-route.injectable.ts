/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../../utils/is-allowed-resource.injectable";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const jobsRouteInjectable = getInjectable({
  id: "jobs-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable, "jobs");

    return {
      path: "/jobs",
      clusterFrame: true,
      isEnabled: isAllowedResource,
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default jobsRouteInjectable;
