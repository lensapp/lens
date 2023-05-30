/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "@k8slens/route";
import type { Route } from "@k8slens/route";
import { Router } from "./router";
import parseRequestInjectable from "./parse-request.injectable";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";
import type { ClusterRoute } from "./cluster-route";


export function getRouteInjectable<T, Path extends string>(
  opts: Omit<Injectable<Route<T, Path>, Route<T, Path>, void>, "lifecycle" | "injectionToken">,
) {
  return getInjectable({
    ...opts,
    injectionToken: routeInjectionToken as unknown as InjectionToken<Route<T, Path>, void>,
  });
}

export function getClusterRouteInjectable<T, Path extends string>(
  opts: Omit<Injectable<ClusterRoute<T, Path>, ClusterRoute<T, Path>, void>, "lifecycle" | "injectionToken">,
) {
  return getInjectable({
    ...opts,
    injectionToken: routeInjectionToken as unknown as InjectionToken<ClusterRoute<T, Path>, void>,
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
