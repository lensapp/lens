/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import type { ProxyTargetUrl } from "http-proxy";
import { Socket } from "net";
import loggerInjectable from "../../../common/logger.injectable";
import handleRouteRequestInjectable from "../handle-route-request.injectable";
import { getRequestId } from "../helpers";
import type { ProxyIncomingMessage } from "../messages";
import proxyRetryInjectable from "./retry.injectable";

const onErrorInjectable = getInjectable({
  id: "on-error",
  instantiate: (di) => {
    const proxyRetry = di.inject(proxyRetryInjectable);
    const logger = di.inject(loggerInjectable);
    const handleRouteRequest = di.inject(handleRouteRequestInjectable);

    return (error: Error, req: ProxyIncomingMessage, res: ServerResponse | Socket, target?: ProxyTargetUrl) => {
      if (proxyRetry.isClosed() || res instanceof Socket) {
        return;
      }

      logger.error(`[LENS-PROXY]: http proxy errored for cluster: ${error}`, { url: req.url });

      if (target) {
        logger.debug(`Failed proxy to target: ${JSON.stringify(target, null, 2)}`);

        if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
          const reqId = getRequestId(req);
          const retryCount = proxyRetry.getCount(reqId);
          const timeoutMs = retryCount * 250;

          if (retryCount < 20) {
            logger.debug(`Retrying proxy request to url: ${reqId}`);
            setTimeout(() => {
              proxyRetry.incrementCount(reqId);
              handleRouteRequest(req, res)
                .catch(error => logger.error(`[LENS-PROXY]: failed to handle request on proxy error: ${error}`));
            }, timeoutMs);
          }
        }
      }

      try {
        res.writeHead(500).end(`Oops, something went wrong.\n${error}`);
      } catch (e) {
        logger.error(`[LENS-PROXY]: Failed to write headers: `, e);
      }
    };
  },
});

export default onErrorInjectable;
