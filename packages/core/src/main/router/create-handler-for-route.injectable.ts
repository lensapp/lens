/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import { loggerInjectionToken } from "@k8slens/logger";
import { object } from "@k8slens/utilities";
import type { LensApiRequest, Route } from "./route";
import { contentTypes } from "./router-content-types";

export type RouteHandler = (request: LensApiRequest<string>, response: ServerResponse) => Promise<void>;
export type CreateHandlerForRoute = (route: Route<unknown, string>) => RouteHandler;

interface LensServerResponse {
  statusCode: number;
  content: any;
  headers: {
    [name: string]: string;
  };
}

const writeServerResponseFor = (serverResponse: ServerResponse) => ({
  statusCode,
  content,
  headers,
}: LensServerResponse) => {
  serverResponse.statusCode = statusCode;

  for (const [name, value] of object.entries(headers)) {
    serverResponse.setHeader(name, value);
  }

  if (content instanceof Buffer) {
    serverResponse.write(content);
    serverResponse.end();
  } else if (content) {
    serverResponse.end(content);
  } else {
    serverResponse.end();
  }
};

const createHandlerForRouteInjectable = getInjectable({
  id: "create-handler-for-route",
  instantiate: (di): CreateHandlerForRoute => {
    const logger = di.inject(loggerInjectionToken);

    return (route) => async (request, response) => {
      const writeServerResponse = writeServerResponseFor(response);

      try {
        const result = await route.handler(request);

        if (!result) {
          const mappedResult = contentTypes.txt.resultMapper({
            statusCode: 204,
            response: undefined,
          });

          writeServerResponse(mappedResult);
        } else if (!result.proxy) {
          const contentType = result.contentType || contentTypes.json;

          writeServerResponse(contentType.resultMapper(result));
        }
      } catch(error) {
        const mappedResult = contentTypes.txt.resultMapper({
          statusCode: 500,
          error: error ? String(error) : "unknown error",
        });

        logger.error(`[ROUTER]: route ${route.path}, called with ${request.path}, threw an error`, error);
        writeServerResponse(mappedResult);
      }
    };
  },
});

export default createHandlerForRouteInjectable;
