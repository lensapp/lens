import net from "net";
import http from "http";
import spdy from "spdy";
import httpProxy from "http-proxy";
import url from "url";
import * as WebSocket from "ws"
import { apiPrefix, apiKubePrefix } from "../common/vars"
import { openShell } from "./node-shell-session";
import { Router } from "./router"
import { ClusterManager } from "./cluster-manager"
import { ContextHandler } from "./context-handler";
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
    const spdyProxy = spdy.createServer({
      spdy: {
        plain: true,
        protocols: ["http/1.1", "spdy/3.1"]
      }
    }, (req: http.IncomingMessage, res: http.ServerResponse) => {
      this.handleRequest(proxy, req, res)
    })
    spdyProxy.on("upgrade", (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      if (req.url.startsWith(`${apiPrefix}?`)) {
        this.handleWsUpgrade(req, socket, head)
      } else {
        this.handleProxyUpgrade(proxy, req, socket, head)
      }
    })
    spdyProxy.on("error", (err) => {
      logger.error("proxy error", err)
    })
    return spdyProxy
  }

  protected async handleProxyUpgrade(proxy: httpProxy, req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const cluster = this.clusterManager.getClusterForRequest(req)
    if (cluster) {
      const proxyUrl = await cluster.contextHandler.resolveAuthProxyUrl() + req.url.replace(apiKubePrefix, "")
      const apiUrl = url.parse(cluster.apiUrl)
      const pUrl = url.parse(proxyUrl)
      const connectOpts = { port: parseInt(pUrl.port), host: pUrl.hostname }
      const proxySocket = new net.Socket()
      proxySocket.connect(connectOpts, () => {
        proxySocket.write(`${req.method} ${pUrl.path} HTTP/1.1\r\n`)
        proxySocket.write(`Host: ${apiUrl.host}\r\n`)
        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          const key = req.rawHeaders[i]
          if (key !== "Host" && key !== "Authorization") {
            proxySocket.write(`${req.rawHeaders[i]}: ${req.rawHeaders[i+1]}\r\n`)
          }
        }
        proxySocket.write("\r\n")
        proxySocket.write(head)
      })

      proxySocket.setKeepAlive(true)
      socket.setKeepAlive(true)
      proxySocket.setTimeout(0)
      socket.setTimeout(0)

      proxySocket.on('data', function (chunk) {
        socket.write(chunk)
      })
      proxySocket.on('end', function () {
        socket.end()
      })
      proxySocket.on('error', function (err) {
        socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
        socket.end()
      })
      socket.on('data', function (chunk) {
        proxySocket.write(chunk)
      })
      socket.on('end', function () {
        proxySocket.end()
      })
      socket.on('error', function () {
        proxySocket.end()
      })
    }
  }

  protected createProxy(): httpProxy {
    const proxy = httpProxy.createProxyServer();
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
