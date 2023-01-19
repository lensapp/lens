/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Route, LensApiRequest } from "./route";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";
import Call from "@hapi/call";
import Subtext from "@hapi/subtext";
import type { Cluster } from "../../common/cluster/cluster";
import type { RouteHandler } from "./create-handler-for-route.injectable";
import type { IncomingMessage, ServerResponse } from "http";
import loggerInjectable from "../../common/logger.injectable";

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

export type RouteRequest = (cluster: Cluster | undefined, req: IncomingMessage, res: ServerResponse) => Promise<void>;

const routeRequestInjectable = getInjectable({
  id: "route-request",
  instantiate: (di): RouteRequest => {
    const routes = di.injectMany(routeInjectionToken);
    const createHandlerForRoute = di.inject(createHandlerForRouteInjectable);
    const router = new Call.Router<RouteHandler>();
    const logger = di.inject(loggerInjectable);

    for (const route of routes) {
      router.add({ method: route.method, path: route.path }, createHandlerForRoute(route));
    }

    return async (cluster, req, res) => {
      if (!req.url || !req.method) {
        return;
      }

      const url = new URL(req.url, "https://localhost");
      const matchingRoute = router.route(req.method?.toLowerCase() ?? "get", url.pathname);

      if (matchingRoute instanceof Error) {
        logger.warn(`[ROUTE-REQUEST]: ${matchingRoute}`, { url: url.pathname });

        return;
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

      return;
    };
  },
});

export default routeRequestInjectable;
