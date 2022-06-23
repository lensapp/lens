/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../../utils/is-allowed-resource.injectable";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const limitRangesRouteInjectable = getInjectable({
  id: "limit-ranges-route",

  instantiate: (di) => {
    const limitRangesIsAllowed = di.inject(
      isAllowedResourceInjectable,
      "limitranges",
    );

    return {
      path: "/limitranges",
      clusterFrame: true,
      isEnabled: limitRangesIsAllowed,
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default limitRangesRouteInjectable;
