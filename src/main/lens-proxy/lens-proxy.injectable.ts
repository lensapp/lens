/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ProxyApiRequestArgs } from "./proxy-functions";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import httpProxy from "http-proxy";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request.injectable";
import lensProxyPortInjectable from "./lens-proxy-port.injectable";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import emitAppEventInjectable from "../../common/app-event-bus/emit-event.injectable";
import loggerInjectable from "../../common/logger.injectable";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import routeRequestInjectable from "../router/route-request.injectable";
import type { IncomingMessage, ServerResponse } from "http";
import assert from "assert";
import net from "net";
import type { Cluster } from "../../common/cluster/cluster";
import { getBoolean } from "../utils/parse-query";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import { apiKubePrefix, apiPrefix } from "../../common/vars";
import { createServer } from "https";

export type GetClusterForRequest = (req: IncomingMessage) => Cluster | undefined;
export type LensProxyApiRequest = (args: ProxyApiRequestArgs) => void | Promise<void>;

export interface LensProxy {
  listen: () => Promise<void>;
  close: () => void;
}

const getRequestId = (req: IncomingMessage) => {
  assert(req.headers.host);

  return req.headers.host + req.url;
};

const watchParam = "watch";
const followParam = "follow";

const isLongRunningRequest = (reqUrl: string) => {
  const url = new URL(reqUrl, "http://localhost");

  return getBoolean(url.searchParams, watchParam) || getBoolean(url.searchParams, followParam);
};

/**
 * This is the list of ports that chrome considers unsafe to allow HTTP
 * conntections to. Because they are the standard ports for processes that are
 * too forgiving in the connection types they accept.
 *
 * If we get one of these ports, the easiest thing to do is to just try again.
 *
 * Source: https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/net/base/port_util.cc
 */
const disallowedPorts = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79,
  87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137,
  139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532,
  540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719, 1720, 1723,
  2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6697,
  10080,
]);

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di): LensProxy => {
    const routeRequest = di.inject(routeRequestInjectable);
    const shellApiRequest = di.inject(shellApiRequestInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const contentSecurityPolicy = di.inject(contentSecurityPolicyInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);
    const logger = di.inject(loggerInjectable);
    const certificate = di.inject(lensProxyCertificateInjectable).get();

    const retryCounters = new Map<string, number>();
    let closed = false;

    const proxy = httpProxy.createProxy()
      .on("proxyRes", (proxyRes, req, res) => {
        retryCounters.delete(getRequestId(req));

        proxyRes.on("aborted", () => { // happens when proxy target aborts connection
          res.end();
        });
      })
      .on("error", (error, req, res, target) => {
        if (closed || res instanceof net.Socket) {
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

    const getProxyTarget = async (req: IncomingMessage, contextHandler: ClusterContextHandler) => {
      if (req.url?.startsWith(apiKubePrefix)) {
        delete req.headers.authorization;
        req.url = req.url.replace(apiKubePrefix, "");

        return contextHandler.getApiTarget(isLongRunningRequest(req.url));
      }

      return undefined;
    };

    const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
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

    const proxyServer = createServer(
      {
        key: certificate.private,
        cert: certificate.cert,
      },
      handleRequest,
    )
      .on("upgrade", (req, socket, head) => {
        const cluster = getClusterForRequest(req);

        if (!cluster || !req.url) {
          logger.error(`[LENS-PROXY]: Could not find cluster for upgrade request from url=${req.url}`);
          socket.destroy();
        } else {
          const isInternal = req.url.startsWith(`${apiPrefix}?`);
          const reqHandler = isInternal ? shellApiRequest : kubeApiUpgradeRequest;

          (async () => {
            try {
              await reqHandler({ req, socket, head, cluster });
            } catch (error) {
              logger.error("[LENS-PROXY]: failed to handle proxy upgrade", error);
            }
          })();
        }
      });

    const attemptToListen = () => new Promise<number>((resolve, reject) => {
      proxyServer.listen(0, "127.0.0.1");

      const onInitialError = (error: Error) => {
        logger.info(`[LENS-PROXY]: Proxy server failed to start: ${error}`);
        reject(error);
      };

      proxyServer
        .once("listening", () => {
          proxyServer.removeListener("error", onInitialError);

          const { address, port } = proxyServer.address() as net.AddressInfo;

          lensProxyPort.set(port);
          logger.info(`[LENS-PROXY]: Proxy server has started at ${address}:${port}`);

          proxyServer.on("error", (error) => {
            logger.info(`[LENS-PROXY]: Subsequent error: ${error}`);
          });

          emitAppEvent({ name: "lens-proxy", action: "listen", params: { port }});
          resolve(port);
        })
        .once("error", onInitialError);
    });

    const listen = async () => {
      const seenPorts = new Set<number>();

      for(;;) {
        proxyServer.close();
        const port = await attemptToListen();

        if (!disallowedPorts.has(port)) {
          // We didn't get a port that would result in an ERR_UNSAFE_PORT error, use it
          return;
        }

        logger.warn(`[LENS-PROXY]: Proxy server has with port known to be considered unsafe to connect to by chrome, restarting...`);

        if (seenPorts.has(port)) {
        /**
         * Assume that if we have seen the port before, then the OS has looped
         * through all the ports possible and we will not be able to get a safe
         * port.
         */
          throw new Error("Failed to start LensProxy due to seeing too many unsafe ports. Please restart Lens.");
        } else {
          seenPorts.add(port);
        }
      }
    };

    const close = () => {
      logger.info("[LENS-PROXY]: Closing server");

      proxyServer.close();
      closed = true;
    };

    return { close, listen };
  },
  causesSideEffects: true,
});

export default lensProxyInjectable;
