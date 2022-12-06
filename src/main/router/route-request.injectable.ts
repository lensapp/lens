/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, Injectable, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import parseRequestInjectable from "./parse-request.injectable";
import type { Route, LensApiRequest } from "./route";
import createHandlerForRouteInjectable from "./create-handler-for-route.injectable";
import Call from "@hapi/call";
import type http from "http";
import type { Cluster } from "../../common/cluster/cluster";
import type { ServerIncomingMessage } from "../lens-proxy/lens-proxy";
import type { RouteHandler } from "./create-handler-for-route.injectable";

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

export type RouteRequest = (cluster: Cluster | undefined, req: ServerIncomingMessage, res: http.ServerResponse) => Promise<boolean>;

const createRouter = (di: DiContainerForInjection) => {
  const routes = di.injectMany(routeInjectionToken);
  const createHandlerForRoute = di.inject(createHandlerForRouteInjectable);
  const router = new Call.Router<RouteHandler>();

  for (const route of routes) {
    router.add({ method: route.method, path: route.path }, createHandlerForRoute(route));
  }

  return router;
};

interface RouterRequestOpts {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster | undefined;
  params: Partial<Record<string, string>>;
  url: URL;
}

const getRequestWith = (di: DiContainerForInjection) => {
  const parseRequest = di.inject(parseRequestInjectable);

  return async (opts: RouterRequestOpts): Promise<LensApiRequest<string>> => {
    const { req, res, url, cluster, params } = opts;
    const { payload } = await parseRequest(req, null, {
      parse: true,
      output: "data",
    });

    return {
      cluster,
      path: url.pathname,
      raw: {
        req, res,
      },
      query: url.searchParams,
      payload,
      params,
      getHeader: (key) => req.headers[key.toLowerCase()],
    };
  };
};

const routeRequestInjectable = getInjectable({
  id: "route-request",
  instantiate: (di): RouteRequest => {
    const router = createRouter(di);
    const getRequest = getRequestWith(di);

    return async (cluster, req, res) => {
      const url = new URL(req.url, "http://localhost");
      const path = url.pathname;
      const method = req.method.toLowerCase();
      const matchingRoute = router.route(method, path);

      if (matchingRoute instanceof Error) {
        return false;
      }

      const request = await getRequest({ req, res, cluster, url, params: matchingRoute.params });

      await matchingRoute.route(request, res);

      return true;
    };
  },
});

export default routeRequestInjectable;
