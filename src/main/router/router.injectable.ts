/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken, lifecycleEnum } from "@ogre-tools/injectable";
import { Router } from "./router";
import parseRequestInjectable from "./parse-request.injectable";
import type { Route } from "./route";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";

export const routeInjectionToken = getInjectionToken<Route<unknown, string>>({
  id: "route-injection-token",
});

export function getRouteInjectable<
  T,
  Path extends string,
>(
  opts: Omit<Injectable<Route<T, Path>, Route<T, Path>, void>, "lifecycle" | "injectionToken">,
): Injectable<Route<T, Path>, Route<T, Path>, void> {
  return {
    ...opts,
    injectionToken: routeInjectionToken as never,
    lifecycle: lifecycleEnum.singleton as never,
  };
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
