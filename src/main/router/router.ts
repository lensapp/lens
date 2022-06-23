/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import Call from "@hapi/call";
import type http from "http";
import { toPairs } from "lodash/fp";
import type { Cluster } from "../../common/cluster/cluster";
import { contentTypes } from "./router-content-types";
import type { LensApiRequest, LensApiResult, Route } from "./route";
import type { ServerIncomingMessage } from "../lens-proxy/lens-proxy";
import type { ParseRequest } from "./parse-request.injectable";

export interface RouterRequestOpts {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster | undefined;
  params: Partial<Record<string, string>>;
  url: URL;
}

interface Dependencies {
  parseRequest: ParseRequest;
}

export class Router {
  protected router = new Call.Router<ReturnType<typeof handleRoute>>();

  constructor(routes: Route<unknown, string>[], private dependencies: Dependencies) {
    routes.forEach(route => {
      this.router.add({ method: route.method, path: route.path }, handleRoute(route));
    });
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

const handleRoute = (route: Route<unknown, string>) => async (request: LensApiRequest<string>, response: http.ServerResponse) => {
  let result: LensApiResult<any> | void;

  const writeServerResponse = writeServerResponseFor(response);

  try {
    result = await route.handler(request);
  } catch(error) {
    const mappedResult = contentTypes.txt.resultMapper({
      statusCode: 500,
      error: error ? String(error) : "unknown error",
    });

    writeServerResponse(mappedResult);

    return;
  }

  if (!result) {
    const mappedResult = contentTypes.txt.resultMapper({
      statusCode: 204,
      response: undefined,
    });

    writeServerResponse(mappedResult);

    return;
  }

  if (result.proxy) {
    return;
  }

  const contentType = result.contentType || contentTypes.json;

  const mappedResult = contentType.resultMapper(result);

  writeServerResponse(mappedResult);
};

const writeServerResponseFor =
  (serverResponse: http.ServerResponse) =>
    ({
      statusCode,
      content,
      headers,
    }: {
    statusCode: number;
    content: any;
    headers: { [name: string]: string };
  }) => {
      serverResponse.statusCode = statusCode;

      const headerPairs = toPairs<string>(headers);

      headerPairs.forEach(([name, value]) => {
        serverResponse.setHeader(name, value);
      });

      if (content instanceof Buffer) {
        serverResponse.write(content);

        serverResponse.end();

        return;
      }

      if (content) {
        serverResponse.end(content);
      } else {
        serverResponse.end();
      }
    };
