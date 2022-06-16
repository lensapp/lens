/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import currentRouteInjectable from "./current-route.injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";

const routeIsActiveInjectable = getInjectable({
  id: "route-is-active",

  instantiate: (di, route: Route<unknown>) => {
    const currentRoute = di.inject(currentRouteInjectable);

    return computed(() => currentRoute.get() === route);
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, route: Route<unknown>) => route.path,
  }),
});

export default routeIsActiveInjectable;
