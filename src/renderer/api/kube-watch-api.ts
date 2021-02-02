// Kubernetes watch-api client
// API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

import type { Cluster } from "../../main/cluster";
import type { IKubeWatchEvent, IKubeWatchEventStreamEnd, IWatchRoutePayload } from "../../main/routes/watch-route";
import type { KubeObject } from "./kube-object";
import type { KubeObjectStore } from "../kube-object.store";

import plimit from "p-limit";
import debounce from "lodash/debounce";
import { autorun, comparer, computed, IReactionDisposer, observable, reaction } from "mobx";
import { autobind, EventEmitter, noop } from "../utils";
import { ensureObjectSelfLink, KubeApi, parseKubeApi } from "./kube-api";
import { KubeJsonApiData, KubeJsonApiError } from "./kube-json-api";
import { apiPrefix, isDebugging, isProduction } from "../../common/vars";
import { apiManager } from "./api-manager";

export { IKubeWatchEvent, IKubeWatchEventStreamEnd };

export interface IKubeWatchMessage<T extends KubeObject = any> {
  namespace?: string;
  data?: IKubeWatchEvent<KubeJsonApiData>
  error?: IKubeWatchEvent<KubeJsonApiError>;
  api?: KubeApi<T>;
  store?: KubeObjectStore<T>;
}

export interface IKubeWatchSubscribeStoreOptions {
  preload?: boolean; // preload store items, default: true
  waitUntilLoaded?: boolean; // subscribe only after loading all stores, default: true
  loadOnce?: boolean; // check store.isLoaded to skip loading if done already, default: false
}

export interface IKubeWatchReconnectOptions {
  reconnectAttempts: number;
  timeout: number;
}

export interface IKubeWatchLog {
  message: string | Error;
  meta?: object;
}

@autobind()
export class KubeWatchApi {
  private requestId = 0;
  private reader: ReadableStreamReader<string>;
  public onMessage = new EventEmitter<[IKubeWatchMessage]>();

  @observable.ref private cluster: Cluster;
  @observable.ref private namespaces: string[] = [];
  @observable subscribers = observable.map<KubeApi, number>();
  @observable isConnected = false;

  @computed get isReady(): boolean {
    return Boolean(this.cluster && this.namespaces);
  }

  @computed get isActive(): boolean {
    return this.apis.length > 0;
  }

  @computed get apis(): string[] {
    if (!this.isReady) {
      return [];
    }

    return Array.from(this.subscribers.keys()).map(api => {
      if (!this.isAllowedApi(api)) {
        return [];
      }

      if (api.isNamespaced && !this.cluster.isGlobalWatchEnabled) {
        return this.namespaces.map(namespace => api.getWatchUrl(namespace));
      }

      return api.getWatchUrl();
    }).flat();
  }

  async init({ getCluster, getNamespaces }: {
    getCluster: () => Cluster,
    getNamespaces: () => string[],
  }): Promise<void> {
    autorun(() => {
      this.cluster = getCluster();
      this.namespaces = getNamespaces();
    });
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

  isAllowedApi(api: KubeApi): boolean {
    return Boolean(this?.cluster.isAllowedResource(api.kind));
  }

  subscribeApi(api: KubeApi | KubeApi[]): () => void {
    const apis: KubeApi[] = [api].flat();

    apis.forEach(api => {
      if (!this.isAllowedApi(api)) return; // skip
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

  preloadStores(stores: KubeObjectStore[], { loadOnce = false } = {}) {
    const limitRequests = plimit(1); // load stores one by one to allow quick skipping when fast clicking btw pages
    const preloading: Promise<any>[] = [];

    for (const store of stores) {
      preloading.push(limitRequests(async () => {
        if (store.isLoaded && loadOnce) return; // skip

        return store.loadAll(this.namespaces);
      }));
    }

    return {
      loading: Promise.allSettled(preloading),
      cancelLoading: () => limitRequests.clearQueue(),
    };
  }

  subscribeStores(stores: KubeObjectStore[], options: IKubeWatchSubscribeStoreOptions = {}): () => void {
    const { preload = true, waitUntilLoaded = true, loadOnce = false } = options;
    const apis = new Set(stores.map(store => store.getSubscribeApis()).flat());
    const unsubscribeList: (() => void)[] = [];
    let isUnsubscribed = false;

    const load = () => this.preloadStores(stores, { loadOnce });
    let preloading = preload && load();
    let cancelReloading: IReactionDisposer = noop;

    const subscribe = () => {
      if (isUnsubscribed) return;
      apis.forEach(api => unsubscribeList.push(this.subscribeApi(api)));
    };

    if (preloading) {
      if (waitUntilLoaded) {
        preloading.loading.then(subscribe, error => {
          this.log({
            message: new Error("Loading stores has failed"),
            meta: { stores, error, options },
          });
        });
      } else {
        subscribe();
      }

      // reload when context namespaces changes
      cancelReloading = reaction(() => this.namespaces, () => {
        preloading?.cancelLoading();
        preloading = load();
      }, {
        equals: comparer.shallow,
      });
    }

    // unsubscribe
    return () => {
      if (isUnsubscribed) return;
      isUnsubscribed = true;
      cancelReloading();
      preloading?.cancelLoading();
      unsubscribeList.forEach(unsubscribe => unsubscribe());
    };
  }

  protected async connectionCheck() {
    if (!this.isConnected) {
      this.log({ message: "Offline: reconnecting.." });
      await this.connect();
    }

    this.log({
      message: `Connection check: ${this.isConnected ? "online" : "offline"}`,
      meta: { connected: this.isConnected },
    });
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

        if (!this.namespaces.includes(message.namespace)) {
          continue; // skip updates from non-watching resources context
        }

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
          message.namespace = namespace;
        }
        break;
      }

      case "ERROR":
        message.error = event as IKubeWatchEvent<KubeJsonApiError>;
        break;

      case "STREAM_END": {
        this.onServerStreamEnd(event as IKubeWatchEventStreamEnd, {
          reconnectAttempts: 5,
          timeout: 1000,
        });
        break;
      }
    }

    return message;
  }

  protected async onServerStreamEnd(event: IKubeWatchEventStreamEnd, opts?: IKubeWatchReconnectOptions) {
    const { apiBase, namespace } = parseKubeApi(event.url);
    const api = apiManager.getApi(apiBase);

    if (!api) return;

    try {
      await api.refreshResourceVersion({ namespace });
      this.connect();
    } catch (error) {
      this.log({
        message: new Error(`Failed to connect on single stream end: ${error}`),
        meta: { event, error },
      });

      if (this.isActive && opts?.reconnectAttempts > 0) {
        opts.reconnectAttempts--;
        setTimeout(() => this.onServerStreamEnd(event, opts), opts.timeout); // repeat event
      }
    }
  }

  protected log({ message, meta = {} }: IKubeWatchLog) {
    if (isProduction && !isDebugging) {
      return;
    }

    const logMessage = `%c[KUBE-WATCH-API]: ${String(message).toUpperCase()}`;
    const isError = message instanceof Error;
    const textStyle = `font-weight: bold;`;
    const time = new Date().toLocaleString();

    if (isError) {
      console.error(logMessage, textStyle, { time, ...meta });
    } else {
      console.info(logMessage, textStyle, { time, ...meta });
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
