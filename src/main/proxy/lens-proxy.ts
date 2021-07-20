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

import net from "net";
import type http from "http";
import spdy from "spdy";
import httpProxy from "http-proxy";
import url from "url";
import { apiPrefix, apiKubePrefix } from "../../common/vars";
import { Router } from "../router";
import type { ContextHandler } from "../context-handler";
import logger from "../logger";
import { Singleton } from "../../common/utils";
import type { Cluster } from "../cluster";

type WSUpgradeHandler = (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => void;

export class LensProxy extends Singleton {
  protected origin: string;
  protected proxyServer: http.Server;
  protected router = new Router();
  protected closed = false;
  protected retryCounters = new Map<string, number>();

  public port: number;

  constructor(handleWsUpgrade: WSUpgradeHandler, protected getClusterForRequest: (req: http.IncomingMessage) => Cluster | undefined) {
    super();

    const proxy = this.createProxy();

    this.proxyServer = spdy.createServer({
      spdy: {
        plain: true,
        protocols: ["http/1.1", "spdy/3.1"]
      }
    }, (req: http.IncomingMessage, res: http.ServerResponse) => {
      this.handleRequest(proxy, req, res);
    });

    this.proxyServer
      .on("upgrade", (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
        if (req.url.startsWith(`${apiPrefix}?`)) {
          handleWsUpgrade(req, socket, head);
        } else {
          this.handleProxyUpgrade(proxy, req, socket, head)
            .catch(error => logger.error(`[LENS-PROXY]: failed to handle proxy upgrade: ${error}`));
        }
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

  protected async handleProxyUpgrade(proxy: httpProxy, req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const cluster = this.getClusterForRequest(req);

    if (cluster) {
      const proxyUrl = await cluster.contextHandler.resolveAuthProxyUrl() + req.url.replace(apiKubePrefix, "");
      const apiUrl = url.parse(cluster.apiUrl);
      const pUrl = url.parse(proxyUrl);
      const connectOpts = { port: parseInt(pUrl.port), host: pUrl.hostname };
      const proxySocket = new net.Socket();

      proxySocket.connect(connectOpts, () => {
        proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`);
        proxySocket.write(`Host: ${apiUrl.host}\r\n`);

        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          const key = req.rawHeaders[i];

          if (key !== "Host" && key !== "Authorization") {
            proxySocket.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i+1]}\r\n`);
          }
        }
        proxySocket.write("\r\n");
        proxySocket.write(head);
      });

      proxySocket.setKeepAlive(true);
      socket.setKeepAlive(true);
      proxySocket.setTimeout(0);
      socket.setTimeout(0);

      proxySocket.on("data", function (chunk) {
        socket.write(chunk);
      });
      proxySocket.on("end", function () {
        socket.end();
      });
      proxySocket.on("error", function () {
        socket.write(`HTTP/${req.httpVersion} 500 Connection error\r\n\r\n`);
        socket.end();
      });
      socket.on("data", function (chunk) {
        proxySocket.write(chunk);
      });
      socket.on("end", function () {
        proxySocket.end();
      });
      socket.on("error", function () {
        proxySocket.end();
      });
    }
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
              this.handleRequest(proxy, req, res)
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
      const isWatchRequest = req.url.includes("watch=");

      return contextHandler.getApiTarget(isWatchRequest);
    }
  }

  protected getRequestId(req: http.IncomingMessage) {
    return req.headers.host + req.url;
  }

  protected async handleRequest(proxy: httpProxy, req: http.IncomingMessage, res: http.ServerResponse) {
    const cluster = this.getClusterForRequest(req);

    if (cluster) {
      const proxyTarget = await this.getProxyTarget(req, cluster.contextHandler);

      if (proxyTarget) {
        // allow to fetch apis in "clusterId.localhost:port" from "localhost:port"
        // this should be safe because we have already validated cluster uuid
        res.setHeader("Access-Control-Allow-Origin", "*");

        return proxy.web(req, res, proxyTarget);
      }
    }
    this.router.route(cluster, req, res);
  }
}
