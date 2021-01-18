import type { KubeJsonApiData, KubeJsonApiError } from "../../renderer/api/kube-json-api";

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

  public async routeWatch(request: LensApiRequest<IWatchRoutePayload>) {
    const { response, cluster, payload } = request;
    const watchers: ApiWatcher[] = [];

    if (!payload?.apis?.length) {
      this.respondJson(response, {
        message: "watch apis list is empty"
      }, 400);

      return;
    }

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    logger.debug(`watch using kubeconfig:${JSON.stringify(cluster.getProxyKubeconfig(), null, 2)}`);

    payload.apis.forEach(apiUrl => {
      const watcher = new ApiWatcher(apiUrl, cluster.getProxyKubeconfig(), response);

      watcher.start();
      watchers.push(watcher);
    });

    request.raw.req.on("close", () => {
      logger.debug("Watch request closed");
      watchers.map(watcher => watcher.stop());
    });

    request.raw.req.on("end", () => {
      logger.debug("Watch request ended");
      watchers.map(watcher => watcher.stop());
    });

  }
}

export const watchRoute = new WatchRoute();
