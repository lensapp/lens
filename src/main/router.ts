/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Call from "@hapi/call";
import Subtext from "@hapi/subtext";
import type http from "http";
import path from "path";
import type { Cluster } from "../common/cluster/cluster";

export interface RouterRequestOpts {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster;
  params: RouteParams;
  url: URL;
}

export interface RouteParams extends Record<string, string> {
  path?: string; // *-route
  namespace?: string;
  service?: string;
  account?: string;
  release?: string;
  repo?: string;
  chart?: string;
}

export interface LensApiRequest<P = any> {
  path: string;
  payload: P;
  params: RouteParams;
  cluster: Cluster;
  response: http.ServerResponse;
  query: URLSearchParams;
  raw: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  };
}

export class Router {
  protected router = new Call.Router();
  static rootPath = path.resolve(__static);

  public async route(cluster: Cluster, req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    const method = req.method.toLowerCase();
    const matchingRoute = this.router.route(method, path);
    const routeFound = !matchingRoute.isBoom;

    if (routeFound) {
      const request = await this.getRequest({ req, res, cluster, url, params: matchingRoute.params });

      await matchingRoute.route(request);

      return true;
    }

    return false;
  }

  protected async getRequest(opts: RouterRequestOpts): Promise<LensApiRequest> {
    const { req, res, url, cluster, params } = opts;
    const { payload } = await Subtext.parse(req, null, {
      parse: true,
      output: "data",
    });

    return {
      cluster,
      path: url.pathname,
      raw: {
        req, res,
      },
      response: res,
      query: url.searchParams,
      payload,
      params,
    };
  }

  addRoute = (route: Route) => {
    this.router.add({ method: route.method, path: route.path }, (request: LensApiRequest) => {
      route.handler(request);
    });
  };
}

export interface Route {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  handler: (request: LensApiRequest) => void | Promise<void>;
}
