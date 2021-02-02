import type { KubeJsonApiData, KubeJsonApiError } from "../../renderer/api/kube-json-api";

import plimit from "p-limit";
import { delay } from "../../common/utils";
import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { KubeConfig, Watch } from "@kubernetes/client-node";
import { ServerResponse } from "http";
import { Request } from "request";
import logger from "../logger";

export interface IKubeWatchEvent<T = KubeJsonApiData | KubeJsonApiError> {
  type: "ADDED" | "MODIFIED" | "DELETED" | "ERROR" | "STREAM_END";
  object?: T;
}

export interface IKubeWatchEventStreamEnd extends IKubeWatchEvent {
  type: "STREAM_END";
  url: string;
  status: number;
}

export interface IWatchRoutePayload {
  apis: string[]; // kube-api url list for subscribing to watch events
}

class ApiWatcher {
  private apiUrl: string;
  private response: ServerResponse;
  private watchRequest: Request;
  private watch: Watch;
  private processor: NodeJS.Timeout;
  private eventBuffer: any[] = [];

  constructor(apiUrl: string, kubeConfig: KubeConfig, response: ServerResponse) {
    this.apiUrl = apiUrl;
    this.watch = new Watch(kubeConfig);
    this.response = response;
  }

  public async start() {
    if (this.processor) {
      clearInterval(this.processor);
    }
    this.processor = setInterval(() => {
      if (this.response.finished) return;
      const events = this.eventBuffer.splice(0);

      events.map(event => this.sendEvent(event));
      this.response.flushHeaders();
    }, 50);
    this.watchRequest = await this.watch.watch(this.apiUrl, {}, this.watchHandler.bind(this), this.doneHandler.bind(this));
  }

  public stop() {
    if (!this.watchRequest) {
      return;
    }

    if (this.processor) {
      clearInterval(this.processor);
    }
    logger.debug(`Stopping watcher for api: ${this.apiUrl}`);

    try {
      this.watchRequest.abort();

      const event: IKubeWatchEventStreamEnd = {
        type: "STREAM_END",
        url: this.apiUrl,
        status: 410,
      };

      this.sendEvent(event);
      logger.debug("watch aborted");
    } catch (error) {
      logger.error(`Watch abort errored:${error}`);
    }
  }

  private watchHandler(phase: string, obj: any) {
    this.eventBuffer.push({
      type: phase,
      object: obj
    });
  }

  private doneHandler(error: Error) {
    if (error) logger.warn(`watch ended: ${error.toString()}`);
    this.watchRequest.abort();
  }

  private sendEvent(evt: IKubeWatchEvent) {
    this.response.write(`${JSON.stringify(evt)}\n`);
  }
}

class WatchRoute extends LensApi {
  private response: ServerResponse;

  private setResponse(response: ServerResponse) {
    // clean up previous connection and stop all corresponding watch-api requests
    // otherwise it happens only by request timeout or something else..
    this.response?.destroy();
    this.response = response;
  }

  public async routeWatch(request: LensApiRequest<IWatchRoutePayload>) {
    const { response, cluster, payload: { apis } = {} } = request;

    if (!apis?.length) {
      this.respondJson(response, {
        message: "watch apis list is empty"
      }, 400);

      return;
    }

    this.setResponse(response);
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    logger.debug(`watch using kubeconfig:${JSON.stringify(cluster.getProxyKubeconfig(), null, 2)}`);

    // limit concurrent k8s requests to avoid possible ECONNRESET-error
    const requests = plimit(5);
    const watchers = new Map<string, ApiWatcher>();
    let isWatchRequestEnded = false;

    apis.forEach(apiUrl => {
      const watcher = new ApiWatcher(apiUrl, cluster.getProxyKubeconfig(), response);

      watchers.set(apiUrl, watcher);

      requests(async () => {
        if (isWatchRequestEnded) return;
        await watcher.start();
        await delay(100);
      });
    });

    function onRequestEnd() {
      if (isWatchRequestEnded) return;
      isWatchRequestEnded = true;
      requests.clearQueue();
      watchers.forEach(watcher => watcher.stop());
      watchers.clear();
    }

    request.raw.req.on("end", () => {
      logger.info("Watch request end");
      onRequestEnd();
    });

    request.raw.req.on("close", () => {
      logger.info("Watch request close");
      onRequestEnd();
    });
  }
}

export const watchRoute = new WatchRoute();
