import type { Cluster } from "../main/cluster";
import type { NamespaceStore } from "./components/+namespaces/namespace.store";

import { action, computed, observable, reaction } from "mobx";
import { autobind } from "./utils";
import { KubeObject } from "./api/kube-object";
import { IKubeWatchEvent, IKubeWatchMessage, kubeWatchApi } from "./api/kube-watch-api";
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
  abstract api: KubeApi<T>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;
  @observable.ref protected cluster: Cluster;

  constructor() {
    super();
    this.bindWatchEventsUpdater();
  }

  // TODO: detach / remove circular dependency
  @observable.ref private namespaceStore: NamespaceStore;

  protected async resolveNamespaceStore(): Promise<NamespaceStore> {
    const { namespaceStore } = await import("./components/+namespaces/namespace.store");

    this.namespaceStore = namespaceStore;

    return namespaceStore;
  }

  protected async resolveCluster(): Promise<Cluster> {
    const { getHostedCluster, clusterStore } = await import("../common/cluster-store");

    await clusterStore.whenLoaded;
    this.cluster = getHostedCluster();
    await this.cluster.whenReady;

    return this.cluster;
  }

  // TODO: figure out how to transparently replace with this.items
  @computed get contextItems(): T[] {
    const contextNamespaces = this.namespaceStore?.contextNamespaces ?? []; // not loaded

    return this.items.filter((item: T) => !item.getNs() || contextNamespaces.includes(item.getId()));
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
    const cluster = await this.resolveCluster();

    if (cluster.isAllowedResource(api.kind)) {
      if (api.isNamespaced) {
        return Promise
          .all(namespaces.map(namespace => api.list({ namespace })))
          .then(items => items.flat());
      }

      return api.list({}, this.query);
    }

    return [];
  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll(namespaces?: string[], { replace = false /*partial update*/ } = {}): Promise<void> {
    this.isLoading = true;

    try {
      // load all available namespaces by default
      if (!namespaces?.length) {
        const namespaceStore = await this.resolveNamespaceStore();

        namespaces = namespaceStore.allowedNamespaces; // load all by default if list not provided
      }

      const items = await this.loadItems({ namespaces, api: this.api });

      this.mergeItems(items, { replace });
      this.isLoaded = true;
    } catch (error) {
      console.error("Loading store items failed", { error, store: this });
      this.resetOnError(error);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  mergeItems(partialItems: T[], { replace = false, updateStore = true, sort = true, filter = true } = {}): T[] {
    let items = partialItems;

    if (!replace) {
      items = this.items.toJS();

      partialItems.forEach(item => {
        const index = items.findIndex(i => i.getId() === item.getId());

        if (index < 0) items.push(item); // add
        else items[index] = item; // update
      });
    }

    if (filter) items = this.filterItemsOnLoad(items);
    if (sort) items = this.sortItems(items);
    if (updateStore) this.items.replace(items);

    return items;
  }

  async loadAllFromContextNamespaces(): Promise<void> {
    return this.loadAll(this.namespaceStore?.contextNamespaces);
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
    kubeWatchApi.onMessage.addListener((evt: IKubeWatchMessage<T>) => {
      if (!this.isLoaded || evt.store !== this) return;
      this.eventsBuffer.push(evt.data);
    });

    reaction(() => this.eventsBuffer.length, this.updateFromEventsBuffer, {
      delay
    });
  }

  getSubscribeApis(): KubeApi[] {
    return [this.api];
  }

  subscribe(apis = this.getSubscribeApis()) {
    return kubeWatchApi.subscribeApi(apis);
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
