import net from "net";
import http from "http";
import httpProxy from "http-proxy";
import url from "url";
import * as WebSocket from "ws"
import { openShell } from "./node-shell-session";
import { Router } from "./router"
import { ClusterManager } from "./cluster-manager"
import { ContextHandler } from "./context-handler";
import { apiKubePrefix } from "../common/vars";
import logger from "./logger"

export class LensProxy {
  protected origin: string
  protected proxyServer: http.Server
  protected router: Router
  protected closed = false
  protected retryCounters = new Map<string, number>()

  static create(port: number, clusterManager: ClusterManager) {
    return new LensProxy(port, clusterManager).listen();
  }

  private constructor(protected port: number, protected clusterManager: ClusterManager) {
    this.origin = `http://localhost:${port}`
    this.router = new Router();
  }

  listen(port = this.port): this {
    this.proxyServer = this.buildCustomProxy().listen(port);
    logger.info(`LensProxy server has started at ${this.origin}`);
    return this;
  }

  close() {
    logger.info("Closing proxy server");
    this.proxyServer.close()
    this.closed = true
  }

  protected buildCustomProxy(): http.Server {
    const proxy = this.createProxy();
    const customProxy = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      this.handleRequest(proxy, req, res);
    });
    customProxy.on("upgrade", (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      this.handleWsUpgrade(req, socket, head)
    });
    customProxy.on("error", (err) => {
      logger.error("proxy error", err)
    });
    return customProxy;
  }

  protected createProxy(): httpProxy {
    const proxy = httpProxy.createProxyServer();
    proxy.on("proxyRes", (proxyRes, req, res) => {
      if (req.method !== "GET") {
        return;
      }
      if (proxyRes.statusCode === 502) {
        const cluster = this.clusterManager.getClusterForRequest(req)
        const proxyError = cluster?.contextHandler.proxyLastError;
        if (proxyError) {
          return res.writeHead(502).end(proxyError);
        }
      }
      const reqId = this.getRequestId(req);
      if (this.retryCounters.has(reqId)) {
        logger.debug(`Resetting proxy retry cache for url: ${reqId}`);
        this.retryCounters.delete(reqId)
      }
    })
    proxy.on("error", (error, req, res, target) => {
      if (this.closed) {
        return;
      }
      if (target) {
        logger.debug("Failed proxy to target: " + JSON.stringify(target, null, 2));
        if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
          const reqId = this.getRequestId(req);
          const retryCount = this.retryCounters.get(reqId) || 0
          const timeoutMs = retryCount * 250
          if (retryCount < 20) {
            logger.debug(`Retrying proxy request to url: ${reqId}`)
            setTimeout(() => {
              this.retryCounters.set(reqId, retryCount + 1)
              this.handleRequest(proxy, req, res)
            }, timeoutMs)
          }
        }
      }
      res.writeHead(500).end("Oops, something went wrong.")
    })

    return proxy;
  }

  protected createWsListener(): WebSocket.Server {
    const ws = new WebSocket.Server({ noServer: true })
    return ws.on("connection", ((socket: WebSocket, req: http.IncomingMessage) => {
      const cluster = this.clusterManager.getClusterForRequest(req);
      const nodeParam = url.parse(req.url, true).query["node"]?.toString();
      openShell(socket, cluster, nodeParam);
    }));
  }

  protected async getProxyTarget(req: http.IncomingMessage, contextHandler: ContextHandler): Promise<httpProxy.ServerOptions> {
    if (req.url.startsWith(apiKubePrefix)) {
      delete req.headers.authorization
      req.url = req.url.replace(apiKubePrefix, "")
      const isWatchRequest = req.url.includes("watch=")
      return await contextHandler.getApiTarget(isWatchRequest)
    }
  }

  protected getRequestId(req: http.IncomingMessage) {
    return req.headers.host + req.url;
  }

  protected async handleRequest(proxy: httpProxy, req: http.IncomingMessage, res: http.ServerResponse) {
    const cluster = this.clusterManager.getClusterForRequest(req)
    if (cluster) {
      await cluster.contextHandler.ensureServer();
      const proxyTarget = await this.getProxyTarget(req, cluster.contextHandler)
      if (proxyTarget) {
        // allow to fetch apis in "clusterId.localhost:port" from "localhost:port"
        res.setHeader("Access-Control-Allow-Origin", this.origin);
        return proxy.web(req, res, proxyTarget);
      }
    }
    this.router.route(cluster, req, res);
  }

  protected async handleWsUpgrade(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const wsServer = this.createWsListener();
    wsServer.handleUpgrade(req, socket, head, (con) => {
      wsServer.emit("connection", con, req);
    });
  }
}
