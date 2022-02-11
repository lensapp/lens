/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { Router, Route } from "../router";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import httpProxy from "http-proxy";

export const routeInjectionToken = getInjectionToken<Route>({
  id: "route-injection-token",
});

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const proxy = isDevelopment ? httpProxy.createProxy() : undefined;

    const router = new Router({
      httpProxy: proxy,
    });

    const routes = di.injectMany(routeInjectionToken);

    routes.forEach(route => {
      router.addRoute(route);
    });

    return router;
  },
});

export default routerInjectable;
