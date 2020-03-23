import { LensApiRequest } from "../router"
import { LensApi } from "../lens-api"
import { Watch, KubeConfig, RuntimeRawExtension } from "@kubernetes/client-node"
import { ServerResponse } from "http"
import { Request } from "request"
import logger from "../logger"

class ApiWatcher {
  private apiUrl: string
  private response: ServerResponse
  private watchRequest: Request
  private watch: Watch

  constructor(apiUrl: string, kubeConfig: KubeConfig, response: ServerResponse) {
    this.apiUrl = apiUrl
    this.watch = new Watch(kubeConfig)
    this.response = response
  }

  public start() {
    this.watchRequest = this.watch.watch(this.apiUrl, {}, this.watchHandler.bind(this), this.doneHandler.bind(this))
  }

  public stop() {
    if (!this.watchRequest) { return }

    this.watchRequest.abort()
  }

  private watchHandler(phase: string, obj: RuntimeRawExtension) {
    this.sendEvent({
      type: phase,
      object: obj
    })
  }

  private doneHandler(error: Error) {
    if (error) {
      logger.error("watch error: " + error.toString())
      this.sendEvent({
        type: "STREAM_END",
        url: this.apiUrl,
        status: 410,
      })
      return
    }
    this.start()
  }

  private sendEvent(evt: any, autoFlush = true) {
    // convert to "text/event-stream" format
    this.response.write(`data: ${JSON.stringify(evt)}\n\n`);
    if (autoFlush) {
      // @ts-ignore
      this.response.flush()
    }
  }
}

class WatchRoute extends LensApi {

  public async routeWatch(request: LensApiRequest) {
    const { params, response, cluster} = request
    const apis: string[] = request.query.getAll("api")
    const watchers: ApiWatcher[] = []

    if (!apis.length) {
      this.respondJson(response, {
        message: "Empty request. Query params 'api' are not provided.",
        example: "?api=/api/v1/pods&api=/api/v1/nodes",
      }, 400)
      return
    }

    response.setHeader("Content-Type", "text/event-stream")
    response.setHeader("Cache-Control", "no-cache")
    response.setHeader("Connection", "keep-alive")

    apis.forEach(apiUrl => {
      const watcher = new ApiWatcher(apiUrl, cluster.contextHandler.kc, response)
      watcher.start()
      watchers.push(watcher)
    })

    request.raw.req.on("close", () => {
      watchers.map(watcher => watcher.stop())
    })

    request.raw.req.on("end", () => {
      watchers.map(watcher => watcher.stop())
    })

  }
}

export const watchRoute = new WatchRoute()
