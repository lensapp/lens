import * as http from "http";
import * as httpProxy from "http-proxy";
import { Socket } from "net";
import * as url from "url";
import * as WebSocket from "ws"
import { ContextHandler } from "./context-handler";
import logger from "./logger"
import * as shell from "./node-shell-session"
import { ClusterManager } from "./cluster-manager"
import { Router } from "./router"

export class LensProxy {
  public static readonly localShellSessions = true

  public port: number;
  protected clusterUrl: url.UrlWithStringQuery
  protected clusterManager: ClusterManager
  protected retryCounters: Map<string, number> = new Map()
  protected router: Router

  constructor(port: number, clusterManager: ClusterManager) {
    this.port = port
    this.clusterManager = clusterManager
    this.router = new Router()
  }

  public run() {
    const proxyServer = this.buildProxyServer();
    proxyServer.listen(this.port, "127.0.0.1")
  }

  protected buildProxyServer() {
    const proxy = this.createProxy();
    const proxyServer = http.createServer(function(req: http.IncomingMessage, res: http.ServerResponse) {
      this.handleRequest(proxy, req, res);
    }.bind(this));
    proxyServer.on("upgrade", function(req: http.IncomingMessage, socket: Socket, head: Buffer) {
      this.handleWsUpgrade(req, socket, head)
    }.bind(this));

    proxyServer.on("error", (err) => {
      logger.error(err)
    });

    return proxyServer;
  }

  protected createProxy() {
    const proxy = httpProxy.createProxyServer();

    proxy.on("proxyRes", (proxyRes, req, res) => {
      if (proxyRes.statusCode === 502) {
        const cluster = this.clusterManager.getClusterForRequest(req)
        if (cluster && cluster.contextHandler.proxyServerError()) {
          res.writeHead(proxyRes.statusCode, {
            "Content-Type": "text/plain"
          })
          res.end(cluster.contextHandler.proxyServerError().toString())
          return
        }
      }

      if (req.method !== "GET") {
        return
      }
      const key = `${req.headers.host}${req.url}`
      if (this.retryCounters.has(key)) {
        logger.debug("Resetting proxy retry cache for url: " + key)
        this.retryCounters.delete(key)
      }
    })
    proxy.on("error", (error, req, res, target) => {
      if (target) {
        logger.debug("Failed proxy to target: " + JSON.stringify(target))
        if (req.method === "GET" && (!res.statusCode || res.statusCode >= 500)) {
          const retryCounterKey = `${req.headers.host}${req.url}`
          const retryCount = this.retryCounters.get(retryCounterKey) || 0
          if (retryCount < 20) {
            logger.debug("Retrying proxy request to url: " + retryCounterKey)
            setTimeout(() => {
              this.retryCounters.set(retryCounterKey, retryCount + 1)
              this.handleRequest(proxy, req, res)
            }, (250 * retryCount))
          }
        }

        //return
      }
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      })
      res.end('Oops, something went wrong.')
    })

    return proxy;
  }

  protected createWsListener() {
    const ws = new WebSocket.Server({ noServer: true})
    ws.on("connection", ((con: WebSocket, req: http.IncomingMessage) => {
      const cluster = this.clusterManager.getClusterForRequest(req)
      const contextHandler = cluster.contextHandler
      const nodeParam = this.getNodeParam(req.url)

      contextHandler.withTemporaryKubeconfig((kubeconfigPath) => {
        return new Promise<boolean>(async (resolve, reject) => {
          const shellSession = await shell.open(con, kubeconfigPath, cluster, nodeParam)
          shellSession.on("exit", () => {
            resolve(true)
          })
        })
      })
    }).bind(this))
    return ws
  }

  protected getNodeParam(requestUrl: string) {
    const reqUrl = url.parse(requestUrl, true)
    const urlParams = reqUrl.query
    let nodeParam: string = null
    for (const [key, value] of Object.entries(urlParams)) {
      if (key === "node") {
        nodeParam = value.toString()
      }
    }
    return nodeParam
  }

  protected async getProxyTarget(req: http.IncomingMessage, contextHandler: ContextHandler): Promise<httpProxy.ServerOptions> {
    if (req.url.startsWith("/api-kube/")) {
      delete req.headers.authorization
      req.url = req.url.replace("/api-kube", "")
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
    try {
      contextHandler.applyHeaders(req)
    } catch (error) {
      res.statusCode = 503
      res.end()
      return
    }
    contextHandler.ensureServer().then(async () => {
      const proxyTarget = await this.getProxyTarget(req, contextHandler)
      if (proxyTarget) {
        proxy.web(req, res, proxyTarget)
      } else {
        this.router.route(cluster, req, res)
      }
    })
  }

  protected async handleWsUpgrade(req: http.IncomingMessage, socket: Socket, head: Buffer) {
    const wsServer = this.createWsListener();
    const cluster = this.clusterManager.getClusterForRequest(req)
    const contextHandler = cluster.contextHandler
    contextHandler.applyHeaders(req);
    wsServer.handleUpgrade(req, socket, head, (con) => {
      wsServer.emit("connection", con, req);
    });
  }
}

export function listen(port: number, clusterManager: ClusterManager) {
  const proxyServer = new LensProxy(port, clusterManager)
  proxyServer.run();
  return proxyServer;
}
