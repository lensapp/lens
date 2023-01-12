/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Route, LensApiRequest } from "./route";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";
import Call from "@hapi/call";
import Subtext from "@hapi/subtext";
import type { Cluster } from "../../common/cluster/cluster";
import type { RouteHandler } from "./create-handler-for-route.injectable";
import type { IncomingMessage, ServerResponse } from "http";

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

export type RouteRequest = (cluster: Cluster | undefined, req: IncomingMessage, res: ServerResponse) => Promise<boolean>;

const createRouter = (di: DiContainerForInjection) => {
  const routes = di.injectMany(routeInjectionToken);
  const createHandlerForRoute = di.inject(createHandlerForRouteInjectable);
  const router = new Call.Router<RouteHandler>();

  for (const route of routes) {
    router.add({ method: route.method, path: route.path }, createHandlerForRoute(route));
  }

  return router;
};

const routeRequestInjectable = getInjectable({
  id: "route-request",
  instantiate: (di): RouteRequest => {
    const router = createRouter(di);

    return async (cluster, req, res) => {
      if (!req.url || !req.method) {
        return false;
      }

      const url = new URL(req.url, "https://localhost");
      const matchingRoute = router.route(req.method, url.pathname);

      if (matchingRoute instanceof Error) {
        return false;
      }

      const { payload } = await Subtext.parse(req, null, {
        parse: true,
        output: "data",
      });
      const request: LensApiRequest<string> = {
        cluster,
        path: url.pathname,
        raw: {
          req, res,
        },
        query: url.searchParams,
        payload,
        params: matchingRoute.params,
        getHeader: (key) => req.headers[key.toLowerCase()],
      };

      await matchingRoute.route(request, res);

      return true;
    };
  },
});

export default routeRequestInjectable;
