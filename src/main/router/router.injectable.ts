/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken, lifecycleEnum } from "@ogre-tools/injectable";
import { Router } from "./router";
import parseRequestInjectable from "./parse-request.injectable";
import type { Route } from "./route";

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

  instantiate: (di) => {
    const routes = di.injectMany(routeInjectionToken);

    return new Router(routes, {
      parseRequest: di.inject(parseRequestInjectable),
    });
  },
});

export default routerInjectable;
