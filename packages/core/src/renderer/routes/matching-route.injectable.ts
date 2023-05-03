/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import routesInjectable from "./routes.injectable";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";
import type { InferParamFromPath, Route } from "../../common/front-end-routing/front-end-route-injection-token";

export interface MatchedRoute {
  route: Route<string>;
  pathParameters: InferParamFromPath<string>;
}

const matchingRouteInjectable = getInjectable({
  id: "matching-route",

  instantiate: (di) => {
    const routes = di.inject(routesInjectable);
    const currentPath = di.inject(currentPathInjectable);

    return computed((): MatchedRoute | undefined => {
      for (const route of routes.get()) {
        const match = matchPath(currentPath.get(), {
          path: route.path,
          exact: true,
        });

        if (match) {
          return {
            route,
            pathParameters: match.params,
          };
        }
      }

      return undefined;
    });
  },
});

export default matchingRouteInjectable;
