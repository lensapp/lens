// Kubernetes watch-api client
// API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

import type { Cluster } from "../../main/cluster";
import type { IKubeWatchEvent, IKubeWatchEventStreamEnd, IWatchRoutePayload } from "../../main/routes/watch-route";
import type { KubeObject } from "./kube-object";
import type { KubeObjectStore } from "../kube-object.store";
import type { NamespaceStore } from "../components/+namespaces/namespace.store";

import debounce from "lodash/debounce";
import { comparer, computed, observable, reaction } from "mobx";
import { autobind, EventEmitter } from "../utils";
import { ensureObjectSelfLink, KubeApi, parseKubeApi } from "./kube-api";
import { KubeJsonApiData, KubeJsonApiError } from "./kube-json-api";
import { apiPrefix, isProduction } from "../../common/vars";
import { apiManager } from "./api-manager";

export { IKubeWatchEvent, IKubeWatchEventStreamEnd };

export interface IKubeWatchMessage<T extends KubeObject = any> {
  data?: IKubeWatchEvent<KubeJsonApiData>
  error?: IKubeWatchEvent<KubeJsonApiError>;
  api?: KubeApi<T>;
  store?: KubeObjectStore<T>;
}

export interface IKubeWatchSubscribeStoreOptions {
  preload?: boolean; // preload store items, default: true
  waitUntilLoaded?: boolean; // subscribe only after loading all stores, default: true
}

export interface IKubeWatchLog {
  message: string | Error;
  meta?: object;
}

@autobind()
export class KubeWatchApi {
  private cluster: Cluster;
  private namespaceStore: NamespaceStore;

  private requestId = 0;
  private isConnected = false;
  private reader: ReadableStreamReader<string>;
  private subscribers = observable.map<KubeApi, number>();

  // events
  public onMessage = new EventEmitter<[IKubeWatchMessage]>();

  @computed get isActive(): boolean {
    return this.apis.length > 0;
  }

  @computed get apis(): string[] {
    const { cluster, namespaceStore } = this;
    const activeApis = Array.from(this.subscribers.keys());

    return activeApis.map(api => {
      if (!cluster.isAllowedResource(api.kind)) {
        return [];
      }

      if (api.isNamespaced) {
        return namespaceStore.getContextNamespaces().map(namespace => api.getWatchUrl(namespace));
      } else {
        return api.getWatchUrl();
      }
    }).flat();
  }

  constructor() {
    this.init();
  }

  private async init() {
    const { getHostedCluster } = await import("../../common/cluster-store");
    const { namespaceStore } = await import("../components/+namespaces/namespace.store");

    await namespaceStore.whenReady;

    this.cluster = getHostedCluster();
    this.namespaceStore = namespaceStore;
    this.bindAutoConnect();
  }

  private bindAutoConnect() {
    const connect = debounce(() => this.connect(), 1000);

    reaction(() => this.apis, connect, {
      fireImmediately: true,
      equals: comparer.structural,
    });

    window.addEventListener("online", () => this.connect());
    window.addEventListener("offline", () => this.disconnect());
    setInterval(() => this.connectionCheck(), 60000 * 5); // every 5m
  }

  getSubscribersCount(api: KubeApi) {
    return this.subscribers.get(api) || 0;
  }

  subscribeApi(api: KubeApi | KubeApi[]) {
    const apis: KubeApi[] = [api].flat();

    apis.forEach(api => {
      this.subscribers.set(api, this.getSubscribersCount(api) + 1);
    });

    return () => {
      apis.forEach(api => {
        const count = this.getSubscribersCount(api) - 1;

        if (count <= 0) this.subscribers.delete(api);
        else this.subscribers.set(api, count);
      });
    };
  }

  subscribeStores(stores: KubeObjectStore[], options: IKubeWatchSubscribeStoreOptions = {}): () => void {
    const { preload = true, waitUntilLoaded = true } = options;
    const loading: Promise<any>[] = [];
    const disposers: Function[] = [];
    let isDisposed = false;

    async function subscribe() {
      if (isDisposed) return;
      const unsubscribeList = await Promise.all(stores.map(store => store.subscribe()));

      disposers.push(...unsubscribeList);
      if (isDisposed) unsubscribe();
    }

    function unsubscribe() {
      isDisposed = true;
      disposers.forEach(dispose => dispose());
      disposers.length = 0;
    }

    if (preload) {
      loading.push(...stores.map(store => store.loadAll()));
    }

    if (waitUntilLoaded) {
      Promise.all(loading).then(subscribe, error => {
        this.log({
          message: new Error("Loading stores has failed"),
          meta: { stores, error, options },
        });
      });
    } else {
      subscribe();
    }

    return unsubscribe;
  }

  protected connectionCheck() {
    this.log({
      message: "connection check",
      meta: { connected: this.isConnected },
    });

    if (this.isConnected) return;

    return this.connect();
  }

  protected async connect(apis = this.apis) {
    this.disconnect(); // close active connections first

    if (!navigator.onLine || !apis.length) {
      this.isConnected = false;

      return;
    }

    this.log({
      message: "Connecting",
      meta: { apis }
    });

    try {
      const requestId = ++this.requestId;
      const abortController = new AbortController();

      const request = await fetch(`${apiPrefix}/watch`, {
        method: "POST",
        body: JSON.stringify({ apis } as IWatchRoutePayload),
        signal: abortController.signal,
        headers: {
          "content-type": "application/json"
        }
      });

      // request above is stale since new request-id has been issued
      if (this.requestId !== requestId) {
        abortController.abort();

        return;
      }

      let jsonBuffer = "";
      const stream = request.body.pipeThrough(new TextDecoderStream());
      const reader = stream.getReader();

      this.isConnected = true;
      this.reader = reader;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break; // exit

        const events = (jsonBuffer + value).split("\n");

        jsonBuffer = this.processBuffer(events);
      }
    } catch (error) {
      this.log({ message: error });
    } finally {
      this.isConnected = false;
    }
  }

  protected disconnect() {
    this.reader?.cancel();
    this.reader = null;
    this.isConnected = false;
  }

  // process received stream events, returns unprocessed buffer chunk if any
  protected processBuffer(events: string[]): string {
    for (const json of events) {
      try {
        const kubeEvent: IKubeWatchEvent = JSON.parse(json);
        const message = this.getMessage(kubeEvent);

        this.onMessage.emit(message);
      } catch (error) {
        return json;
      }
    }

    return "";
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
    const { apiBase, namespace } = parseKubeApi(event.url);
    const api = apiManager.getApi(apiBase);

    if (api) {
      try {
        await api.refreshResourceVersion({ namespace });
        this.connect();
      } catch (error) {
        this.log({
          message: new Error(`Failed to connect on single stream end: ${error}`),
          meta: { event, error },
        });

        if (this.isActive) {
          setTimeout(() => this.onServerStreamEnd(event), 1000);
        }
      }
    }
  }

  protected log({ message, meta = {} }: IKubeWatchLog) {
    if (isProduction) {
      return;
    }

    const logMessage = `%c[KUBE-WATCH-API]: ${String(message).toUpperCase()}`;
    const isError = message instanceof Error;
    const textStyle = `font-weight: bold; ${isError ? "color: red;" : ""}`;
    const time = new Date().toLocaleString();

    if (isError) {
      console.error(logMessage, textStyle, { time, ...meta });
    } else {
      console.info(logMessage, textStyle, { time, ...meta });
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
