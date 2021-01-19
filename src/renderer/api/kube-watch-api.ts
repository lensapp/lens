// Kubernetes watch-api client

import type { Cluster } from "../../main/cluster";
import type { IKubeWatchEvent, IKubeWatchEventStreamEnd, IWatchRoutePayload } from "../../main/routes/watch-route";

import type { KubeObject } from "./kube-object";
import { computed, observable, reaction } from "mobx";
import { autobind, EventEmitter } from "../utils";
import { ensureObjectSelfLink, KubeApi } from "./kube-api";
import { KubeJsonApiData, KubeJsonApiError } from "./kube-json-api";
import { KubeObjectStore } from "../kube-object.store";
import { apiPrefix, isProduction } from "../../common/vars";
import { apiManager } from "./api-manager";

export { IKubeWatchEvent, IKubeWatchEventStreamEnd };

export interface IKubeWatchMessage<T extends KubeObject = any> {
  data?: IKubeWatchEvent<KubeJsonApiData>
  error?: IKubeWatchEvent<KubeJsonApiError>;
  api?: KubeApi<T>;
  store?: KubeObjectStore<T>;
}

export interface IKubeWatchLog {
  message: string | Error;
  meta?: object | any;
}

@autobind()
export class KubeWatchApi {
  protected stream: ReadableStream<string>; // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  protected subscribers = observable.map<KubeApi, number>();
  protected reconnectTimeoutMs = 5000;
  protected maxReconnectsOnError = 10;
  protected jsonBuffer = "";
  protected splitter = "\n";

  // events
  onMessage = new EventEmitter<[IKubeWatchMessage]>();

  constructor() {
    this.bindAutoConnect();
  }

  private bindAutoConnect() {
    return reaction(() => this.activeApis, () => this.connect(), {
      fireImmediately: true,
      delay: 500,
    });
  }

  @computed get activeApis() {
    return Array.from(this.subscribers.keys());
  }

  getSubscribersCount(api: KubeApi) {
    return this.subscribers.get(api) || 0;
  }

  subscribe(...apis: KubeApi[]) {
    apis.forEach(api => {
      this.subscribers.set(api, this.getSubscribersCount(api) + 1);
    });

    return () => apis.forEach(api => {
      const count = this.getSubscribersCount(api) - 1;

      if (count <= 0) this.subscribers.delete(api);
      else this.subscribers.set(api, count);
    });
  }

  protected async resolveCluster(): Promise<Cluster> {
    const { getHostedCluster } = await import("../../common/cluster-store");

    return getHostedCluster();
  }

  protected async getRequestPayload(): Promise<IWatchRoutePayload> {
    const cluster = await this.resolveCluster();
    const { namespaceStore } = await import("../components/+namespaces/namespace.store");

    await namespaceStore.whenReady;

    return {
      apis: this.activeApis.map(api => {
        if (!cluster.isAllowedResource(api.kind)) {
          return [];
        }

        if (api.isNamespaced) {
          return namespaceStore.getContextNamespaces().map(namespace => api.getWatchUrl(namespace));
        } else {
          return api.getWatchUrl();
        }
      }).flat()
    };
  }

  protected async connect() {
    this.disconnect(); // close active connection first

    const payload = await this.getRequestPayload();

    if (!payload.apis.length) {
      return;
    }

    this.log({
      message: "connecting",
      meta: payload,
    });

    try {
      const req = await fetch(`${apiPrefix}/watch`, {
        method: "POST",
        body: JSON.stringify(payload),
        keepalive: true,
        headers: {
          "content-type": "application/json"
        }
      });

      this.stream = req.body.pipeThrough(new TextDecoderStream());
      this.stream.cancel = () => reader.cancel();

      const reader = this.stream.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;
        this.processStreamChunk(value);
      }
    } catch (error) {
      this.log({ message: error });
    }
  }

  protected async processStreamChunk(chunk: string) {
    const { jsonBuffer, splitter } = this;
    const eventsBuffer = (jsonBuffer + chunk).split(splitter);
    let jsonEvent: string;

    while (jsonEvent = eventsBuffer.shift()) {
      try {
        const kubeEvent: IKubeWatchEvent = JSON.parse(jsonEvent);
        const message = this.getMessage(kubeEvent);

        this.onMessage.emit(message);
      } catch (error) {
        eventsBuffer.unshift(jsonEvent); // put unparsed json back to buffer
        break;
      }
    }

    // save last unprocessed json-tail or reset buffer otherwise
    this.jsonBuffer = eventsBuffer.join(splitter);
  }

  protected async disconnect() {
    this.stream?.cancel();
    this.stream = null;
  }

  protected getMessage(event: IKubeWatchEvent): IKubeWatchMessage {
    const message: IKubeWatchMessage = {};

    switch (event.type) {
      case "ADDED":
      case "DELETED":

      case "MODIFIED": {
        const data = event as IKubeWatchEvent<KubeJsonApiData>;
        const api = apiManager.getApiByKind(data.object.kind, data.object.apiVersion);

        message.data = data;

        if (api) {
          ensureObjectSelfLink(api, data.object);

          const { namespace, resourceVersion } = data.object.metadata;

          api.setResourceVersion(namespace, resourceVersion);
          api.setResourceVersion("", resourceVersion);

          message.api = api;
          message.store = apiManager.getStore(api);
        }
        break;
      }

      case "ERROR":
        message.error = event as IKubeWatchEvent<KubeJsonApiError>;
        break;

      case "STREAM_END": {
        this.onServerStreamEnd(event as IKubeWatchEventStreamEnd);
        break;
      }
    }

    return message;
  }

  protected async onServerStreamEnd(event: IKubeWatchEventStreamEnd) {
    const { apiBase, namespace } = KubeApi.parseApi(event.url);
    const api = apiManager.getApi(apiBase);

    if (api) {
      try {
        await api.refreshResourceVersion({ namespace });
        this.connect();
      } catch (error) {
        this.log({
          message: new Error("failed to reconnect on stream end"),
          meta: { error, event },
        });

        if (this.subscribers.size > 0) {
          setTimeout(() => {
            this.onServerStreamEnd(event);
          }, 1000);
        }
      }
    }
  }

  protected log({ message, meta }: IKubeWatchLog) {
    if (isProduction) return;

    const logMessage = `%c[KUBE-WATCH-API]: ${String(message).toUpperCase()}`;
    const isError = message instanceof Error;
    const textStyle = `font-weight: bold; ${isError ? "color: red;" : ""}`;

    if (isError) {
      console.error(logMessage, textStyle, meta);
    } else {
      console.info(logMessage, textStyle, meta);
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
