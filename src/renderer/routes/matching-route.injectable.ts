/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import routesInjectable from "./routes.injectable";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";
import { iter } from "../utils";

const getMatchDataForRouteFrom = (currentPath: string) => (route: Route<unknown>) => {
  const match = matchPath(currentPath, {
    path: route.path,
    exact: true,
  });

  return {
    route,
    isMatching: Boolean(match),
    pathParameters: match?.params ?? {},
  };
};

const matchingRouteInjectable = getInjectable({
  id: "matching-route",

  instantiate: (di) => {
    const routes = di.inject(routesInjectable);
    const currentPath = di.inject(currentPathInjectable);

    return computed(() => (
      iter.chain(routes.get().values())
        .map(getMatchDataForRouteFrom(currentPath.get()))
        .find(data => data.isMatching)
    ));
  },
});

export default matchingRouteInjectable;
