/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";

const routePathParametersInjectable = getInjectable({
  id: "route-path-parameters",

  instantiate: (di, route: Route<unknown>) => {
    const currentPath = di.inject(currentPathInjectable);

    // TODO: Reuse typing from route for accuracy
    return computed((): Record<string, string> => {
      const match = matchPath(currentPath.get(), {
        path: route.path,
        exact: true,
      });

      return match ? match.params : {};
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, route: Route<unknown>) => route,
  }),
});

export default routePathParametersInjectable;
