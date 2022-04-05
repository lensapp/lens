/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import { matchPath } from "react-router";
import currentPathInjectable from "./current-path.injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";
import { getOrInsertWith } from "../utils";

const routePathParametersInjectable = getInjectable({
  id: "route-path-parameters",

  instantiate: (di) => {
    const currentPath = di.inject(currentPathInjectable);
    const pathParametersCache = new Map<Route<unknown>, IComputedValue<Partial<Record<string, string>>>>();

    return <Param>(route: Route<Param>): IComputedValue<Partial<Param>> => (
      getOrInsertWith(pathParametersCache, route, () => computed(() => (
        console.log(currentPath.get()),
        matchPath(currentPath.get(), {
          path: route.path,
          exact: true,
        })?.params ?? {}
      )))
    );
  },
});

export default routePathParametersInjectable;
