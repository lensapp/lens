import type { ClusterContext } from "./components/context";
import { action, computed, observable, reaction, when } from "mobx";
import { autobind } from "./utils";
import { KubeObject } from "./api/kube-object";
import { IKubeWatchEvent, IKubeWatchMessage, kubeWatchApi } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi, parseKubeApi } from "./api/kube-api";
import { KubeJsonApiData } from "./api/kube-json-api";

export interface KubeStoreLoadAllOptions {
  namespaces?: string[]; // load specific namespaces into store or all items (by default)
  updateStore?: boolean; // merge loaded items with specific arguments or return as a result
  autoCleanUp?: boolean; // run cleaning operation for non-updated namespaced items in store (default: true)
}

export interface KubeStoreLoadItemsOptions {
  namespaces: string[]; // list of namespaces for loading into store with following merge-update
  api?: KubeApi; // api for loading resources, used for overriding, see: roles-store.ts
  merge?: boolean; // merge items into store, default: false
}

export interface KubeStoreMergeItemsOptions {
  replaceAll?: boolean; // completely replace items in store, default: false
  updateStore?: boolean; // merge items into store after loading, default: true
  sort?: boolean; // sort items before update
  filter?: boolean; // sort items before update
}

@autobind()
export abstract class KubeObjectStore<T extends KubeObject = any> extends ItemStore<T> {
  @observable static defaultContext: ClusterContext; // TODO: support multiple cluster contexts

  abstract api: KubeApi<T>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;

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

      if (!itemNamespace) return true; // cluster-wide resource

      return namespaces.includes(itemNamespace);
    });
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

  protected async loadItems({ namespaces, api = this.api, merge = false }: KubeStoreLoadItemsOptions): Promise<T[]> {
    await this.contextReady;
    const { allNamespaces, cluster } = this.context;
    let items: T[] = [];

    if (!cluster.isAllowedResource(api.kind)) {
      return items;
    }

    try {
      // optimize check for loading "all namespaces" with single k8s request
      const allNamespacesAffected = allNamespaces.every(ns => namespaces.includes(ns));

      // cluster list request, e.g. /api/v1/nodes
      if (!api.isNamespaced || (cluster.isAdmin && allNamespacesAffected)) {
        items = await api.list({}, this.query);
      } else {
        // otherwise load resources per requested namespaces
        items = await Promise
          .all(namespaces.map(namespace => api.list({ namespace })))
          .then(items => items.flat());
      }
    } catch (error) {
      console.error("Loading items failed", { error, namespaces, api });
    }

    if (merge && items.length > 0) {
      this.mergeItems(items, { replaceAll: false, updateStore: true });
    }

    return items;
  }

  protected filterItemsOnLoad(items: T[]) {
    return items;
  }

  @action
  async loadAll({ namespaces, updateStore = true, autoCleanUp = true }: KubeStoreLoadAllOptions = {}): Promise<void | T[]> {
    await this.contextReady;
    this.isLoading = true;

    try {
      const newItems = await this.loadItems({
        namespaces: namespaces ?? this.context.allNamespaces, // load all by default
        api: this.api
      });

      if (updateStore) {
        this.mergeItems(newItems, {
          replaceAll: false, // partial update
          updateStore: true,
        });
      } else {
        return newItems;
      }

      // clean up possibly stale items and reload removed namespaces
      if (autoCleanUp) {
        await this.cleanUpAfterLoad(newItems).refreshRemovedItems();
      }

      this.isLoaded = true;
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
  mergeItems(partialItems: T[], {
    replaceAll = false,
    updateStore = true,
    sort = true,
    filter = true,
  }: KubeStoreMergeItemsOptions = {}): T[] {
    let items = partialItems;

    try {
      // update existing items
      if (!replaceAll) {
        const partialIds = partialItems.map(item => item.getId());

        items = [
          ...this.items.filter(existingItem => !partialIds.includes(existingItem.getId())),
          ...partialItems,
        ];
      }

      if (filter) items = this.filterItemsOnLoad(items);
      if (sort) items = this.sortItems(items);
      if (updateStore) this.items.replace(items);
    } catch (error) {
      // todo: improve logging
      console.error("[KUBE-STORE]: merging items failed", { error, store: this });

      return [];
    }

    return items;
  }

  @action
  private cleanUpAfterLoad(updatedItems: T[]) {
    const getUniqNamespaces = (items: T[]) => Array.from(new Set(items.map(item => item.getNs()).filter(Boolean)));

    const loadedNamespaces = getUniqNamespaces(this.items);
    const updatedNamespaces = getUniqNamespaces(updatedItems);
    const staleNamespaces = loadedNamespaces.filter(ns => !updatedNamespaces.includes(ns));

    if (staleNamespaces.length > 0) {
      const freshItems = this.items.toJS().filter(item => {
        if (!item.getNs()) return true; // cluster resource

        return !staleNamespaces.includes(item.getNs());
      });

      this.items.replace(freshItems);
    }

    return {
      removedNamespaces: staleNamespaces,
      refreshRemovedItems: () => this.loadItems({ namespaces: staleNamespaces, merge: true }),
    };
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
