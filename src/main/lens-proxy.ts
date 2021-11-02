/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type net from "net";
import type http from "http";
import spdy from "spdy";
import httpProxy from "http-proxy";
import { apiPrefix, apiKubePrefix } from "../common/vars";
import type { Router } from "./router";
import type { ContextHandler } from "./context-handler";
import logger from "./logger";
import { Singleton } from "../common/utils";
import type { Cluster } from "./cluster";
import type { ProxyApiRequestArgs } from "./proxy-functions";
import { appEventBus } from "../common/event-bus";
import { getBoolean } from "./utils/parse-query";

type GetClusterForRequest = (req: http.IncomingMessage) => Cluster | null;

export interface LensProxyFunctions {
  getClusterForRequest: GetClusterForRequest,
  shellApiRequest: (args: ProxyApiRequestArgs) => void | Promise<void>;
  kubeApiRequest: (args: ProxyApiRequestArgs) => void | Promise<void>;
}

const watchParam = "watch";
const followParam = "follow";

export function isLongRunningRequest(reqUrl: string) {
  const url = new URL(reqUrl, "http://localhost");

  return getBoolean(url.searchParams, watchParam) || getBoolean(url.searchParams, followParam);
}

export class LensProxy extends Singleton {
  protected origin: string;
  protected proxyServer: http.Server;
  protected closed = false;
  protected retryCounters = new Map<string, number>();
  protected proxy = this.createProxy();
  protected getClusterForRequest: GetClusterForRequest;

  public port: number;

  constructor(protected router: Router, functions: LensProxyFunctions) {
    super();

    const { shellApiRequest, kubeApiRequest } = functions;

    this.getClusterForRequest = functions.getClusterForRequest;

    this.proxyServer = spdy.createServer({
      spdy: {
        plain: true,
        protocols: ["http/1.1", "spdy/3.1"],
      },
    }, (req: http.IncomingMessage, res: http.ServerResponse) => {
      this.handleRequest(req, res);
    });

    this.proxyServer
      .on("upgrade", (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
        const isInternal = req.url.startsWith(`${apiPrefix}?`);
        const reqHandler = isInternal ? shellApiRequest : kubeApiRequest;

        (async () => reqHandler({ req, socket, head }))()
          .catch(error => logger.error(logger.error(`[LENS-PROXY]: failed to handle proxy upgrade: ${error}`)));
      });
  }

  /**
   * Starts the lens proxy.
   * @resolves After the server is listening
   * @rejects if there is an error before that happens
   */
  listen(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.proxyServer.listen(0, "127.0.0.1");

      this.proxyServer
        .once("listening", () => {
          this.proxyServer.removeAllListeners("error"); // don't reject the promise

          const { address, port } = this.proxyServer.address() as net.AddressInfo;

          logger.info(`[LENS-PROXY]: Proxy server has started at ${address}:${port}`);

          this.proxyServer.on("error", (error) => {
            logger.info(`[LENS-PROXY]: Subsequent error: ${error}`);
          });

          this.port = port;
          appEventBus.emit({ name: "lens-proxy", action: "listen", params: { port }});
          resolve();
        })
        .once("error", (error) => {
          logger.info(`[LENS-PROXY]: Proxy server failed to start: ${error}`);
          reject(error);
        });
    });
  }

  close() {
    logger.info("Closing proxy server");
    this.proxyServer.close();
    this.closed = true;
  }

  protected createProxy(): httpProxy {
    const proxy = httpProxy.createProxyServer();

    proxy.on("proxyRes", (proxyRes, req, res) => {
      const retryCounterId = this.getRequestId(req);

      if (this.retryCounters.has(retryCounterId)) {
        this.retryCounters.delete(retryCounterId);
      }

      if (!res.headersSent && req.url) {
        const url = new URL(req.url, "http://localhost");

        if (url.searchParams.has("watch")) {
          res.statusCode = proxyRes.statusCode;
          res.flushHeaders();
        }
      }
    });

    proxy.on("error", (error, req, res, target) => {
      if (this.closed) {
        return;
      }

      logger.error(`[LENS-PROXY]: http proxy errored for cluster: ${error}`, { url: req.url });

      if (target) {
        logger.debug(`Failed proxy to target: ${JSON.stringify(target, null, 2)}`);

        if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
          const reqId = this.getRequestId(req);
          const retryCount = this.retryCounters.get(reqId) || 0;
          const timeoutMs = retryCount * 250;

          if (retryCount < 20) {
            logger.debug(`Retrying proxy request to url: ${reqId}`);
            setTimeout(() => {
              this.retryCounters.set(reqId, retryCount + 1);
              this.handleRequest(req, res)
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
    });

    return proxy;
  }

  protected async getProxyTarget(req: http.IncomingMessage, contextHandler: ContextHandler): Promise<httpProxy.ServerOptions | void> {
    if (req.url.startsWith(apiKubePrefix)) {
      delete req.headers.authorization;
      req.url = req.url.replace(apiKubePrefix, "");

      return contextHandler.getApiTarget(isLongRunningRequest(req.url));
    }
  }

  protected getRequestId(req: http.IncomingMessage) {
    return req.headers.host + req.url;
  }

  protected async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const cluster = this.getClusterForRequest(req);

    if (cluster) {
      const proxyTarget = await this.getProxyTarget(req, cluster.contextHandler);

      if (proxyTarget) {
        return this.proxy.web(req, res, proxyTarget);
      }
    }
    this.router.route(cluster, req, res);
  }
}
