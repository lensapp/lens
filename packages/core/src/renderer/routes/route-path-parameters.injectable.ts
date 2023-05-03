/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";
import type { InferParamFromPath, Route } from "../../common/front-end-routing/front-end-route-injection-token";

const routePathParametersInjectable = getInjectable({
  id: "route-path-parameters",

  instantiate: (di) => {
    const currentPath = di.inject(currentPathInjectable);

    return <Path extends string>(route: Route<Path>) => computed(() => {
      const match = matchPath(currentPath.get(), {
        path: route.path,
        exact: true,
      });

      return match?.params as InferParamFromPath<Path> | undefined;
    });
  },
});

export default routePathParametersInjectable;
