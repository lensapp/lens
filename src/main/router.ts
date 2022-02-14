/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Call from "@hapi/call";
import Subtext from "@hapi/subtext";
import type http from "http";
import type httpProxy from "http-proxy";
import { toPairs } from "lodash/fp";
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

const respondFor =
  (contentType: string) =>
    (
      content: any,
      statusCode: number,
      response: http.ServerResponse,
    ) => {
      response.statusCode = statusCode;
      response.setHeader("Content-Type", contentType);

      if (content instanceof Buffer) {
        response.write(content);

        response.end();

        return;
      }

      response.end(content);
    };

export type SupportedFileExtension = "json" | "txt" | "html" | "css" | "gif" | "jpg" | "png" | "svg" | "js" | "woff2" | "ttf";

export const contentTypes: Record<SupportedFileExtension, LensApiResultContentType> = {
  json: {
    respond: (
      content: any,
      statusCode: number,
      response: http.ServerResponse,
    ) => {
      response.statusCode = statusCode;
      response.setHeader("Content-Type", "application/json");

      if (content instanceof Buffer) {
        response.write(content);
        response.end();

        return;
      }

      const normalizedContent =
        typeof content === "object" ? JSON.stringify(content) : content;

      response.end(normalizedContent);
    },
  },

  txt: {
    respond: respondFor("text/plain"),
  },

  html: {
    respond: respondFor("text/html"),
  },

  css: {
    respond: respondFor("text/css"),
  },

  gif: {
    respond: respondFor("image/gif"),
  },

  jpg: {
    respond: respondFor("image/jpeg"),
  },

  png: {
    respond: respondFor("image/png"),
  },

  svg: {
    respond: respondFor("image/svg+xml"),
  },

  js: {
    respond: respondFor("application/javascript"),
  },

  woff2: {
    respond: respondFor("font/woff2"),
  },

  ttf: {
    respond: respondFor("font/ttf"),
  },
};

export class Router {
  protected router = new Call.Router();
  protected static rootPath = path.resolve(__static);

  constructor(routes: Route<any>[]) {
    routes.forEach(route => {
      this.router.add({ method: route.method, path: route.path }, async (request: LensApiRequest) => {
        let result: LensApiResult<any> | void;

        try {
          result = await route.handler(request);
        } catch(error) {
          contentTypes.txt.respond(error.toString(), 422, request.response);

          return;
        }

        if (!result) {
          contentTypes.txt.respond(null, 204, request.response);

          return;
        }

        const {
          response,
          error,
          statusCode = error ? 400 : 200,
          contentType = contentTypes.json,
          headers = {},
          proxy,
        } = result;

        if (proxy) {
          return;
        }

        const headerNameValuePairs = toPairs<string>(headers);

        headerNameValuePairs.forEach(([key, value]) => {
          request.response.setHeader(key, value);
        });

        contentType.respond(error || response, statusCode, request.response);
      });
    });
  }

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
}

interface LensApiResultContentType {
  respond: (content: any, statusCode: number, response: http.ServerResponse) => void;
}

export interface LensApiResult<TResult> {
  statusCode?: number;
  response?: TResult;
  error?: any;
  contentType?: LensApiResultContentType;
  headers?: { Location: string };
  proxy?: httpProxy;
}

export interface Route<TResponse> {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  handler: (
    request: LensApiRequest
  ) =>
    | Promise<LensApiResult<TResponse>>
    | Promise<void>
    | LensApiResult<TResponse>
    | void;
}
