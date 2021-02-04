import type { Cluster } from "../main/cluster";
import { action, observable, reaction } from "mobx";
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

  constructor() {
    super();
    this.bindWatchEventsUpdater();
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

  protected async resolveCluster(): Promise<Cluster> {
    const { getHostedCluster } = await import("../common/cluster-store");

    return getHostedCluster();
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
  async loadAll(namespaces: string[] = []): Promise<void> {
    this.isLoading = true;

    try {
      if (!namespaces.length) {
        const { namespaceStore } = await import("./components/+namespaces/namespace.store");

        // load all available namespaces by default
        namespaces.push(...namespaceStore.allowedNamespaces);
      }

      let items = await this.loadItems({ namespaces, api: this.api });

      items = this.filterItemsOnLoad(items);
      items = this.sortItems(items);

      this.items.replace(items);
      this.isLoaded = true;
    } catch (error) {
      console.error("Loading store items failed", { error, store: this });
      this.resetOnError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadSelectedNamespaces(): Promise<void> {
    const { namespaceStore } = await import("./components/+namespaces/namespace.store");

    return this.loadAll(namespaceStore.getContextNamespaces());
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
    const eventsBuffer = this.eventsBuffer.clear();

    if (!eventsBuffer.length) {
      return;
    }

    for (const { type, object } of eventsBuffer) {
      const item = this.getById(object.metadata?.uid);
      const api = apiManager.getApiByKind(object.kind, object.apiVersion);

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new api.objectConstructor(object);

          if (!item) {
            this.items.push(newItem);
          } else {
            const index = this.getIndex(item);

            this.items.splice(index, 1, newItem);
          }
          break;
        case "DELETED":
          this.items.remove(item);
          break;
      }
    }

    // sort and limit items to store's maximum
    const newItems = this.sortItems(this.items.slice(-this.bufferSize));

    this.items.replace(newItems);
  }
}
