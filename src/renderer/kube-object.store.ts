import type { ClusterContext } from "./components/context";

import { action, computed, observable, reaction, when } from "mobx";
import { autobind, noop, rejectPromiseBy } from "./utils";
import { KubeObject, KubeStatus } from "./api/kube-object";
import { IKubeWatchEvent } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi, parseKubeApi } from "./api/kube-api";
import { KubeJsonApiData } from "./api/kube-json-api";
import { Notifications } from "./components/notifications";
import { AbortController } from "abort-controller";

export interface KubeObjectStoreLoadingParams {
  namespaces: string[];
  api?: KubeApi;
  reqInit?: RequestInit;
}

@autobind()
export abstract class KubeObjectStore<T extends KubeObject = any> extends ItemStore<T> {
  @observable static defaultContext: ClusterContext; // TODO: support multiple cluster contexts

  abstract api: KubeApi<T>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;
  @observable private loadedNamespaces?: string[];

  contextReady = when(() => Boolean(this.context));
  namespacesReady = when(() => Boolean(this.loadedNamespaces));

  constructor() {
    super();
    this.bindWatchEventsUpdater();
  }

  get context(): ClusterContext {
    return KubeObjectStore.defaultContext;
  }

  @computed get contextItems(): T[] {
    const namespaces = this.context?.contextNamespaces ?? [];

    return this.items.filter(item => {
      const itemNamespace = item.getNs();

      return !itemNamespace /* cluster-wide */ || namespaces.includes(itemNamespace);
    });
  }

  getTotalCount(): number {
    return this.contextItems.length;
  }

  get query(): IKubeApiQueryParams {
    const { limit } = this;

    if (!limit) {
      return {};
    }

    return { limit };
  }

  getStatuses?(items: T[]): Record<string, number>;

  getAllByNs(namespace: string | string[], strict = false): T[] {
    const namespaces: string[] = [].concat(namespace);

    if (namespaces.length) {
      return this.items.filter(item => namespaces.includes(item.getNs()));
    } else if (!strict) {
      return this.items;
    }
  }

  getById(id: string) {
    return this.items.find(item => item.getId() === id);
  }

  getByName(name: string, namespace?: string): T {
    return this.items.find(item => {
      return item.getName() === name && (
        namespace ? item.getNs() === namespace : true
      );
    });
  }

  getByPath(path: string): T {
    return this.items.find(item => item.selfLink === path);
  }

  getByLabel(labels: string[] | { [label: string]: string }): T[] {
    if (Array.isArray(labels)) {
      return this.items.filter((item: T) => {
        const itemLabels = item.getLabels();

        return labels.every(label => itemLabels.includes(label));
      });
    } else {
      return this.items.filter((item: T) => {
        const itemLabels = item.metadata.labels || {};

        return Object.entries(labels)
          .every(([key, value]) => itemLabels[key] === value);
      });
    }
  }

  protected async loadItems({ namespaces, api, reqInit }: KubeObjectStoreLoadingParams): Promise<T[]> {
    if (this.context?.cluster.isAllowedResource(api.kind)) {
      if (!api.isNamespaced) {
        return api.list({ reqInit }, this.query);
      }

      const isLoadingAll = this.context.allNamespaces?.length > 1
                            && this.context.cluster.accessibleNamespaces.length === 0
                            && this.context.allNamespaces.every(ns => namespaces.includes(ns));

      if (isLoadingAll) {
        this.loadedNamespaces = [];

        return api.list({ reqInit }, this.query);
      } else {
        this.loadedNamespaces = namespaces;

        return Promise // load resources per namespace
          .all(namespaces.map(namespace => api.list({ namespace, reqInit })))
          .then(items => items.flat().filter(Boolean));
      }
    }

    return [];
  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll(options: { namespaces?: string[], merge?: boolean, reqInit?: RequestInit } = {}): Promise<void | T[]> {
    await this.contextReady;
    this.isLoading = true;

    try {
      const {
        namespaces = this.context.allNamespaces, // load all namespaces by default
        merge = true, // merge loaded items or return as result
        reqInit,
      } = options;

      const items = await this.loadItems({ namespaces, api: this.api, reqInit });

      this.isLoaded = true;

      if (merge) {
        this.mergeItems(items, { replace: false });
      } else {
        this.mergeItems(items, { replace: true });
      }

      return items;
    } catch (error) {
      if (error.message) {
        Notifications.error(error.message);
      }
      console.error("Loading store items failed", { error });
      this.resetOnError(error);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  reloadAll(opts: { force?: boolean, namespaces?: string[], merge?: boolean } = {}) {
    const { force = false, ...loadingOptions } = opts;

    if (this.isLoading || (this.isLoaded && !force)) {
      return;
    }

    return this.loadAll(loadingOptions);
  }

  @action
  protected mergeItems(partialItems: T[], { replace = false, updateStore = true, sort = true, filter = true } = {}): T[] {
    let items = partialItems;

    // update existing items
    if (!replace) {
      const namespaces = partialItems.map(item => item.getNs());

      items = [
        ...this.items.filter(existingItem => !namespaces.includes(existingItem.getNs())),
        ...partialItems,
      ];
    }

    if (filter) items = this.filterItemsOnLoad(items);
    if (sort) items = this.sortItems(items);
    if (updateStore) this.items.replace(items);

    return items;
  }

  protected resetOnError(error: any) {
    if (error) this.reset();
  }

  protected async loadItem(params: { name: string; namespace?: string }): Promise<T> {
    return this.api.get(params);
  }

  @action
  async load(params: { name: string; namespace?: string }): Promise<T> {
    const { name, namespace } = params;
    let item = this.getByName(name, namespace);

    if (!item) {
      item = await this.loadItem(params);
      const newItems = this.sortItems([...this.items, item]);

      this.items.replace(newItems);
    }

    return item;
  }

  @action
  async loadFromPath(resourcePath: string) {
    const { namespace, name } = parseKubeApi(resourcePath);

    return this.load({ name, namespace });
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<T>): Promise<T> {
    return this.api.create(params, data);
  }

  async create(params: { name: string; namespace?: string }, data?: Partial<T>): Promise<T> {
    const newItem = await this.createItem(params, data);
    const items = this.sortItems([...this.items, newItem]);

    this.items.replace(items);

    return newItem;
  }

  async update(item: T, data: Partial<T>): Promise<T> {
    const newItem = await item.update<T>(data);
    const index = this.items.findIndex(item => item.getId() === newItem.getId());

    this.items.splice(index, 1, newItem);

    return newItem;
  }

  async remove(item: T) {
    await item.delete();
    this.items.remove(item);
    this.selectedItemsIds.delete(item.getId());
  }

  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.remove));
  }

  // collect items from watch-api events to avoid UI blowing up with huge streams of data
  protected eventsBuffer = observable.array<IKubeWatchEvent<KubeJsonApiData>>([], { deep: false });

  protected bindWatchEventsUpdater(delay = 1000) {
    reaction(() => this.eventsBuffer.length, this.updateFromEventsBuffer, {
      delay
    });
  }

  getSubscribeApis(): KubeApi[] {
    return [this.api];
  }

  subscribe(apis = this.getSubscribeApis()) {
    const abortController = new AbortController();

    // This waits for
    Promise.race([rejectPromiseBy(abortController.signal), Promise.all([this.contextReady, this.namespacesReady])])
      .then(() => {
        if (this.context.cluster.isGlobalWatchEnabled && this.loadedNamespaces.length === 0) {
          apis.forEach(api => this.watchNamespace(api, "", abortController));
        } else {
          apis.forEach(api => {
            this.loadedNamespaces.forEach((namespace) => {
              this.watchNamespace(api, namespace, abortController);
            });
          });
        }
      })
      .catch(noop); // ignore DOMExceptions

    return () => {
      abortController.abort();
    };
  }

  private watchNamespace(api: KubeApi<T>, namespace: string, abortController: AbortController) {
    let timedRetry: NodeJS.Timeout;
    const watch = () => api.watch({
      namespace,
      abortController,
      callback
    });

    const { signal } = abortController;

    const callback = (data: IKubeWatchEvent, error: any) => {
      if (!this.isLoaded || error instanceof DOMException) return;

      if (error instanceof Response) {
        if (error.status === 404) {
          // api has gone, let's not retry
          return;
        } else { // not sure what to do, best to retry
          clearTimeout(timedRetry);
          timedRetry = setTimeout(watch, 5000);
        }
      } else if (error instanceof KubeStatus && error.code === 410) {
        clearTimeout(timedRetry);
        // resourceVersion has gone, let's try to reload
        timedRetry = setTimeout(() => {
          (
            namespace
              ? this.loadAll({ namespaces: [namespace], reqInit: { signal } })
              : this.loadAll({ merge: false, reqInit: { signal } })
          ).then(watch);
        }, 1000);
      } else if (error) { // not sure what to do, best to retry
        clearTimeout(timedRetry);
        timedRetry = setTimeout(watch, 5000);
      }

      if (data) {
        this.eventsBuffer.push(data);
      }
    };

    signal.addEventListener("abort", () => clearTimeout(timedRetry));
    watch();
  }

  @action
  protected updateFromEventsBuffer() {
    const items = this.items.toJS();

    for (const { type, object } of this.eventsBuffer.clear()) {
      const index = items.findIndex(item => item.getId() === object.metadata?.uid);
      const item = items[index];
      const api = apiManager.getApiByKind(object.kind, object.apiVersion);

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new api.objectConstructor(object);

          if (!item) {
            items.push(newItem);
          } else {
            items[index] = newItem;
          }
          break;
        case "DELETED":
          if (item) {
            items.splice(index, 1);
          }
          break;
      }
    }

    // update items
    this.items.replace(this.sortItems(items.slice(-this.bufferSize)));
  }
}
