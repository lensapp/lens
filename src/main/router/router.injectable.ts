/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { Route, Router } from "../router";

export const routeInjectionToken = getInjectionToken<Route>({
  id: "route-injection-token",
});

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => {
    const routes = di.injectMany(routeInjectionToken);

    return new Router(routes);
  },
});

export default routerInjectable;
