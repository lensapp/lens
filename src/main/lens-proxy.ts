import net from "net";
import http from "http";
import httpProxy from "http-proxy";
import url from "url";
import * as WebSocket from "ws"
import * as nodeShell from "./node-shell-session"
import { Router } from "./router"
import { ClusterManager } from "./cluster-manager"
import { ContextHandler } from "./context-handler";
import { apiKubePrefix } from "../common/vars";
import logger from "./logger"

export class LensProxy {
  protected clusterManager: ClusterManager
  protected proxyServer: http.Server
  protected router: Router
  protected closed = false
  protected retryCounters = new Map<string, number>()

  static create(clusterManager: ClusterManager) {
    return new LensProxy(clusterManager).listen();
  }

  private constructor(clusterManager: ClusterManager) {
    this.clusterManager = clusterManager;
    this.router = new Router();
  }

  listen(): this {
    const proxyServer = this.buildCustomProxy();
    const { proxyPort } = this.clusterManager;
    this.proxyServer = proxyServer.listen(proxyPort);
    logger.info(`LensProxy server has started http://localhost:${proxyPort}`);
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
      if (proxyRes.statusCode === 502) {
        const cluster = this.clusterManager.getClusterForRequest(req)
        if (cluster && cluster.contextHandler.proxyServerError()) {
          res.writeHead(proxyRes.statusCode, {
            "Content-Type": "text/plain"
          })
          res.end(cluster.contextHandler.proxyServerError())
          return
        }
      }
      if (req.method !== "GET") {
        return
      }
      const reqUrl = `${req.headers.host}${req.url}`
      if (this.retryCounters.has(reqUrl)) {
        logger.debug("Resetting proxy retry cache for url: " + reqUrl)
        this.retryCounters.delete(reqUrl)
      }
    })
    proxy.on("error", (error, req, res, target) => {
      if (this.closed) {
        return;
      }
      if (target) {
        logger.debug("Failed proxy to target: " + JSON.stringify(target, null, 2));
        if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
          const retryCounterKey = `${req.headers.host}${req.url}`
          const retryCount = this.retryCounters.get(retryCounterKey) || 0
          const timeoutMs = retryCount * 250
          if (retryCount < 20) {
            logger.debug("Retrying proxy request to url: " + retryCounterKey)
            setTimeout(() => {
              this.retryCounters.set(retryCounterKey, retryCount + 1)
              this.handleRequest(proxy, req, res)
            }, timeoutMs)
          }
        }
      }
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      })
      res.end('Oops, something went wrong.')
    })

    return proxy;
  }

  protected createWsListener(): WebSocket.Server {
    const ws = new WebSocket.Server({ noServer: true })
    return ws.on("connection", (async (socket: WebSocket, req: http.IncomingMessage) => {
      const cluster = this.clusterManager.getClusterForRequest(req)
      const nodeParam = url.parse(req.url, true).query["node"]?.toString();
      await nodeShell.open(socket, cluster, nodeParam);
    }));
  }

  // fixme: remove api prefix?
  protected async getProxyTarget(req: http.IncomingMessage, contextHandler: ContextHandler): Promise<httpProxy.ServerOptions> {
    if (req.url.startsWith(apiKubePrefix)) {
      delete req.headers.authorization
      req.url = req.url.replace(apiKubePrefix, "")
      const isWatchRequest = req.url.includes("watch=")
      return await contextHandler.getApiTarget(isWatchRequest)
    }
  }

  protected async handleRequest(proxy: httpProxy, req: http.IncomingMessage, res: http.ServerResponse) {
    const cluster = this.clusterManager.getClusterForRequest(req)
    if (!cluster) {
      logger.error("Got request to unknown cluster")
      logger.debug(req.headers.host + req.url)
      res.statusCode = 503
      res.end()
      return
    }
    const contextHandler = cluster.contextHandler
    await contextHandler.ensureServer();
    const proxyTarget = await this.getProxyTarget(req, contextHandler)
    if (proxyTarget) {
      proxy.web(req, res, proxyTarget)
    } else {
      this.router.route(cluster, req, res);
    }
  }

  protected async handleWsUpgrade(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const wsServer = this.createWsListener();
    wsServer.handleUpgrade(req, socket, head, (con) => {
      wsServer.emit("connection", con, req);
    });
  }
}
