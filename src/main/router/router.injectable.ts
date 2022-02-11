/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { Router, Route } from "../router";

export const routeInjectionToken = getInjectionToken<Route>({
  id: "route-injection-token",
});

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => {
    const router = new Router();

    const routes = di.injectMany(routeInjectionToken);

    routes.forEach(route => {
      router.addRoute(route);
    });

    return router;
  },
});

export default routerInjectable;
