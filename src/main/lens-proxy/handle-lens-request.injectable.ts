/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import type { IncomingMessage } from "http";
import HttpProxyServer from "http-proxy";
import { Socket } from "net";
import loggerInjectable from "../../common/logger.injectable";
import type { HandleRequest } from "./handle-request-for.injectable";
import handleRequestForInjectable from "./handle-request-for.injectable";

const getRequestId = (req: IncomingMessage) => {
  assert(req.headers.host);

  return req.headers.host + req.url;
};

export interface HandleLensRequest {
  handle: HandleRequest;
  stopHandling: () => void;
}

const handleLensRequestInjectable = getInjectable({
  id: "handle-lens-request",
  instantiate: (di): HandleLensRequest => {
    const logger = di.inject(loggerInjectable);
    const handleRequestFor = di.inject(handleRequestForInjectable);

    const retryCounters = new Map<string, number>();
    let closed = false;

    const proxy = HttpProxyServer.createProxy()
      .on("proxyRes", (proxyRes, req, res) => {
        retryCounters.delete(getRequestId(req));

        proxyRes.on("aborted", () => { // happens when proxy target aborts connection
          res.end();
        });
      })
      .on("error", (error, req, res, target) => {
        if (closed || res instanceof Socket) {
          return;
        }

        logger.error(`[LENS-PROXY]: http proxy errored for cluster: ${error}`, { url: req.url });

        if (target) {
          logger.debug(`Failed proxy to target: ${JSON.stringify(target, null, 2)}`);

          if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
            const reqId = getRequestId(req);
            const retryCount = retryCounters.get(reqId) || 0;
            const timeoutMs = retryCount * 250;

            if (retryCount < 20) {
              logger.debug(`Retrying proxy request to url: ${reqId}`);
              setTimeout(() => {
                retryCounters.set(reqId, retryCount + 1);

                (async () => {
                  try {
                    await handleRequest(req, res);
                  } catch (error) {
                    logger.error(`[LENS-PROXY]: failed to handle request on proxy error: ${error}`);
                  }
                })();
              }, timeoutMs);
            }
          }
        }

        try {
          res.writeHead(500).end(`Oops, something went wrong.\n${error}`);
        } catch (e) {
          logger.error(`[LENS-PROXY]: Failed to write headers: `, e);
        }
      });

    const handleRequest = handleRequestFor(proxy);

    return {
      handle: handleRequest,
      stopHandling: () => closed = true,
    };
  },
});

export default handleLensRequestInjectable;
