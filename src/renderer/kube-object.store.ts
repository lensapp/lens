import type { Cluster } from "../main/cluster";
import { action, observable, reaction } from "mobx";
import { autobind } from "./utils";
import { KubeObject } from "./api/kube-object";
import { IKubeWatchEvent, kubeWatchApi } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi } from "./api/kube-api";
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
    kubeWatchApi.addListener(this, this.onWatchApiEvent);
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
  async loadAll({ namespaces: contextNamespaces }: { namespaces?: string[] } = {}) {
    this.isLoading = true;

    try {
      if (!contextNamespaces) {
        const { namespaceStore } = await import("./components/+namespaces/namespace.store");

        contextNamespaces = namespaceStore.getContextNamespaces();
      }

      let items = await this.loadItems({ namespaces: contextNamespaces, api: this.api });

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
    const { namespace, name } = KubeApi.parseApi(resourcePath);

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
  protected eventsBuffer = observable<IKubeWatchEvent<KubeJsonApiData>>([], { deep: false });

  protected bindWatchEventsUpdater(delay = 1000) {
    return reaction(() => this.eventsBuffer.toJS()[0], this.updateFromEventsBuffer, {
      delay
    });
  }

  subscribe(apis = [this.api]) {
    return KubeApi.watchAll(...apis);
  }

  protected onWatchApiEvent(evt: IKubeWatchEvent) {
    if (!this.isLoaded) return;
    this.eventsBuffer.push(evt);
  }

  @action
  protected updateFromEventsBuffer() {
    if (!this.eventsBuffer.length) {
      return;
    }
    // create latest non-observable copy of items to apply updates in one action (==single render)
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
            items.splice(index, 1, newItem);
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
