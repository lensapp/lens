// Kubernetes watch-api consumer
import type { IKubeWatchEvent, IKubeWatchEventStreamEnd, IWatchRoutePayload } from "../../main/routes/watch-route";
import type { KubeObjectStore } from "../kube-object.store";
import type { KubeObject } from "./kube-object";

import { computed, observable, reaction } from "mobx";
import { autobind, EventEmitter } from "../utils";
import { KubeJsonApiData, KubeJsonApiError } from "./kube-json-api";
import { ensureObjectSelfLink, KubeApi } from "./kube-api";
import { getHostedCluster } from "../../common/cluster-store";
import { apiPrefix, isDevelopment } from "../../common/vars";
import { apiManager } from "./api-manager";

export { IKubeWatchEvent, IKubeWatchEventStreamEnd }

export interface IKubeWatchMessage<T extends KubeObject = any> {
  data?: IKubeWatchEvent<KubeJsonApiData>
  error?: IKubeWatchEvent<KubeJsonApiError>;
  api?: KubeApi<T>;
  store?: KubeObjectStore<T>;
}

@autobind()
export class KubeWatchApi {
  protected stream: ReadableStream<Uint8Array>; // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  protected subscribers = observable.map<KubeApi, number>();
  protected reconnectTimeoutMs = 5000;
  protected maxReconnectsOnError = 10;

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

  protected async getWatchRoutePayload(): Promise<IWatchRoutePayload> {
    const { namespaceStore } = await import("../components/+namespaces/namespace.store");
    await namespaceStore.whenReady;
    const { isAdmin } = getHostedCluster();

    return {
      apis: this.activeApis.map(api => {
        if (isAdmin && !api.isNamespaced) {
          return api.getWatchUrl();
        }

        if (api.isNamespaced) {
          return namespaceStore.getContextNamespaces().map(namespace => api.getWatchUrl(namespace));
        }

        return [];
      }).flat()
    };
  }

  protected async connect() {
    this.disconnect(); // close active connection first

    const payload = await this.getWatchRoutePayload();

    if (!payload.apis.length) {
      return;
    }

    this.writeLog({
      data: ["CONNECTING", payload.apis]
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

      const reader = req.body.getReader();
      const handleEvent = this.handleEvent.bind(this);

      this.stream = new ReadableStream({
        start(controller) {
          return reader.read().then(function processEvent({ done, value }): Promise<void> {
            if (done) {
              controller.close();
              return;
            }
            handleEvent(value);
            controller.enqueue(value);
            return reader.read().then(processEvent);
          });
        },
        cancel() {
          reader.cancel();
        }
      });
    } catch (error) {
      this.writeLog({
        error: ["CONNECTION ERROR", error]
      });
    }
  }

  protected async disconnect() {
    if (this.stream) {
      this.stream.cancel();
      this.stream = null;
    }
  }

  protected handleEvent(eventStreamChunk: Uint8Array) {
    try {
      const jsonText = new TextDecoder().decode(eventStreamChunk);
      const event: IKubeWatchEvent = JSON.parse(jsonText);
      const message = this.getMessage(event);
      this.onMessage.emit(message);
    } catch (error) {
      this.writeLog({
        error: ["failed to parse watch-api event", error]
      });
    }
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
        this.writeLog({
          error: ["failed to reconnect after stream ending", { event, error }]
        });

        if (this.subscribers.size > 0) {
          setTimeout(() => {
            this.onServerStreamEnd(event);
          }, 1000);
        }
      }
    }
  }

  protected writeLog({ data, error }: { data?: any[], error?: any[] } = {}) {
    if (isDevelopment) {
      const logStyle = `font-weight: bold; ${error ? "color: red;" : ""}`;
      console.log("%cKUBE-WATCH-API:", logStyle, ...Array.from(data || error));
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
