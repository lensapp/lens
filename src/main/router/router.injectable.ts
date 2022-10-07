/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { Router } from "./router";
import parseRequestInjectable from "./parse-request.injectable";
import type { Route } from "./route";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";

export const routeInjectionToken = getInjectionToken<Route<unknown, string>>({
  id: "route-injection-token",
});

export function getRouteInjectable<T, Path extends string>(
  opts: Omit<Injectable<Route<T, Path>, Route<T, Path>, void>, "lifecycle" | "injectionToken">,
) {
  return getInjectable({
    ...opts,
    injectionToken: routeInjectionToken as unknown as InjectionToken<Route<T, Path>, void>,
  });
}

const routerInjectable = getInjectable({
  id: "router",

  instantiate: (di) => new Router({
    parseRequest: di.inject(parseRequestInjectable),
    routes: di.injectMany(routeInjectionToken),
    createHandlerForRoute: di.inject(createHandlerForRouteInjectable),
  }),
});

export default routerInjectable;
