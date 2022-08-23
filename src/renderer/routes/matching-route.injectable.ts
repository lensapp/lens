/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import routesInjectable from "./routes.injectable";
import { matches } from "lodash/fp";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";

const matchingRouteInjectable = getInjectable({
  id: "matching-route",

  instantiate: (di) => {
    const routes = di.inject(routesInjectable);
    const currentPath = di.inject(currentPathInjectable);

    return computed(() => {
      const matchedRoutes = routes.get().map((route) => {
        const match = matchPath(currentPath.get(), {
          path: route.path,
          exact: true,
        });

        return {
          route,
          isMatching: !!match,
          pathParameters: match ? match.params : {},
        };
      });

      return matchedRoutes.find(matches({ isMatching: true }));
    });
  },
});

export default matchingRouteInjectable;
