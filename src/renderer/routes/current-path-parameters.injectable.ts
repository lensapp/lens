/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import matchingRouteInjectable from "./matching-route.injectable";

const currentPathParametersInjectable = getInjectable({
  id: "current-path-parameters",

  instantiate: (di) => {
    const matchingRoute = di.inject(matchingRouteInjectable);

    return computed((): Record<string, string> => {
      const match = matchingRoute.get();

      return match ? match.pathParameters: {};
    });
  },
});

export default currentPathParametersInjectable;
