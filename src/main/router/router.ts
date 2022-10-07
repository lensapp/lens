/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Call from "@hapi/call";
import type http from "http";
import type { Cluster } from "../../common/cluster/cluster";
import type { LensApiRequest, Route } from "./route";
import type { ServerIncomingMessage } from "../lens-proxy/lens-proxy";
import type { ParseRequest } from "./parse-request.injectable";
import type { CreateHandlerForRoute, RouteHandler } from "./create-handler-for-route.injectable";

export interface RouterRequestOpts {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster | undefined;
  params: Partial<Record<string, string>>;
  url: URL;
}

interface Dependencies {
  parseRequest: ParseRequest;
  createHandlerForRoute: CreateHandlerForRoute;
  readonly routes: Route<unknown, string>[];
}

export class Router {
  private readonly router = new Call.Router<RouteHandler>();

  constructor(private readonly dependencies: Dependencies) {
    for (const route of this.dependencies.routes) {
      this.router.add({ method: route.method, path: route.path }, this.dependencies.createHandlerForRoute(route));
    }
  }

  public async route(cluster: Cluster | undefined, req: ServerIncomingMessage, res: http.ServerResponse): Promise<boolean> {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    const method = req.method.toLowerCase();
    const matchingRoute = this.router.route(method, path);

    if (matchingRoute instanceof Error) {
      return false;
    }

    const request = await this.getRequest({ req, res, cluster, url, params: matchingRoute.params });

    await matchingRoute.route(request, res);

    return true;
  }

  protected async getRequest(opts: RouterRequestOpts): Promise<LensApiRequest<string>> {
    const { req, res, url, cluster, params } = opts;
    const { payload } = await this.dependencies.parseRequest(req, null, {
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
    };
  }
}
