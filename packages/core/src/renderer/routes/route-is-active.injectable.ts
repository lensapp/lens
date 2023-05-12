/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";
import currentPathInjectable from "./current-path.injectable";
import { matchPath } from "react-router-dom";

const routeIsActiveInjectable = getInjectable({
  id: "route-is-active",

  instantiate: (di, route: Route<unknown>) => {
    const currentPath = di.inject(currentPathInjectable);

    return computed(() => !!matchPath(currentPath.get(), {
      path: route.path,
      exact: true,
    }));
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, route: Route<unknown>) => route.path,
  }),
});

export default routeIsActiveInjectable;
