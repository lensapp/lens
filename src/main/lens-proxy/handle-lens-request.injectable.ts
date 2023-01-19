/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import type { IncomingMessage, ServerResponse } from "http";
import HttpProxyServer from "http-proxy";
import { Socket } from "net";
import loggerInjectable from "../../common/logger.injectable";
import { apiKubePrefix } from "../../common/vars";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import routeRequestInjectable from "../router/route-request.injectable";
import { getBoolean } from "../utils/parse-query";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";

const getRequestId = (req: IncomingMessage) => {
  assert(req.headers.host);

  return req.headers.host + req.url;
};

const watchParam = "watch";
const followParam = "follow";

export const isLongRunningRequest = (reqUrl: string) => {
  const url = new URL(reqUrl, "http://localhost");

  return getBoolean(url.searchParams, watchParam) || getBoolean(url.searchParams, followParam);
};

export type HandleRequest = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export interface HandleLensRequest {
  handle: HandleRequest;
  stopHandling: () => void;
}

const handleLensRequestInjectable = getInjectable({
  id: "handle-lens-request",
  instantiate: (di): HandleLensRequest => {
    const logger = di.inject(loggerInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const contentSecurityPolicy = di.inject(contentSecurityPolicyInjectable);
    const routeRequest = di.inject(routeRequestInjectable);

    const retryCounters = new Map<string, number>();
    let closed = false;

    const getProxyTarget = async (req: IncomingMessage, contextHandler: ClusterContextHandler) => {
      if (req.url?.startsWith(apiKubePrefix)) {
        delete req.headers.authorization;
        req.url = req.url.replace(apiKubePrefix, "");

        return contextHandler.getApiTarget(isLongRunningRequest(req.url));
      }

      return undefined;
    };

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

    const handleRequest: HandleRequest = async (req, res) => {
      const cluster = getClusterForRequest(req);

      if (cluster) {
        const proxyTarget = await getProxyTarget(req, cluster.contextHandler);

        if (proxyTarget) {
          return proxy.web(req, res, proxyTarget);
        }
      }

      res.setHeader("Content-Security-Policy", contentSecurityPolicy);
      await routeRequest(cluster, req, res);
    };

    return {
      handle: handleRequest,
      stopHandling: () => closed = true,
    };
  },
});

export default handleLensRequestInjectable;
