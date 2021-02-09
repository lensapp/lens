import type { ClusterContext } from "./components/context";

import { action, computed, observable, reaction, when } from "mobx";
import { autobind } from "./utils";
import { KubeObject } from "./api/kube-object";
import { IKubeWatchEvent } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi, parseKubeApi } from "./api/kube-api";
import { KubeJsonApiData } from "./api/kube-json-api";

export interface KubeObjectStoreLoadingParams {
  namespaces: string[];
  api?: KubeApi;
}

@autobind()
export abstract class KubeObjectStore<T extends KubeObject = any> extends ItemStore<T> {
  @observable static defaultContext: ClusterContext; // TODO: support multiple cluster contexts

  abstract api: KubeApi<T>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;
  private loadedNamespaces: string[] = [];

  contextReady = when(() => Boolean(this.context));

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

  protected async loadItems({ namespaces, api }: KubeObjectStoreLoadingParams): Promise<T[]> {
    if (this.context?.cluster.isAllowedResource(api.kind)) {
      if (!api.isNamespaced) {
        return api.list({}, this.query);
      }

      const isLoadingAll = this.context.allNamespaces.every(ns => namespaces.includes(ns));

      if (isLoadingAll) {
        this.loadedNamespaces = [];

        return api.list({}, this.query);
      } else {
        this.loadedNamespaces = namespaces;

        return Promise // load resources per namespace
          .all(namespaces.map(namespace => api.list({ namespace })))
          .then(items => items.flat());
      }
    }

    return [];
  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll(options: { namespaces?: string[], merge?: boolean } = {}): Promise<void | T[]> {
    await this.contextReady;
    this.isLoading = true;

    try {
      const {
        namespaces = this.context.allNamespaces, // load all namespaces by default
        merge = true, // merge loaded items or return as result
      } = options;

      const items = await this.loadItems({ namespaces, api: this.api });

      this.isLoaded = true;

      if (merge) {
        this.mergeItems(items, { replace: false });
      } else {
        return items;
      }
    } catch (error) {
      console.error("Loading store items failed", { error, store: this });
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
      const partialIds = partialItems.map(item => item.getId());

      items = [
        ...this.items.filter(existingItem => !partialIds.includes(existingItem.getId())),
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
    let disposers: {(): void}[] = [];

    const callback = (data: IKubeWatchEvent) => {
      if (!this.isLoaded) return;

      this.eventsBuffer.push(data);
    };

    if (this.context.cluster?.isGlobalWatchEnabled && this.loadedNamespaces.length === 0) {
      disposers = apis.map(api => api.watch({
        namespace: "",
        callback: (data) => callback(data),
      }));
    } else {
      apis.map(api => {
        this.loadedNamespaces.forEach((namespace) => {
          disposers.push(api.watch({
            namespace,
            callback: (data) => callback(data)
          }));
        });
      });
    }

    return () => disposers.forEach(dispose => dispose());
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
