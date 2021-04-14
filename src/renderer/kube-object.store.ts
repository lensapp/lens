import type { ClusterContext } from "./components/context";

import { action, computed, observable, reaction, when } from "mobx";
import { autobind } from "./utils";
import { KubeObject, KubeStatus } from "./api/kube-object";
import { IKubeWatchEvent } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { IKubeApiQueryParams, KubeApi, parseKubeApi } from "./api/kube-api";
import { KubeJsonApiData } from "./api/kube-json-api";
import logger from "../main/logger";

export interface KubeObjectStoreLoadingParams<Spec, Status> {
  namespaces: string[];
  api?: KubeApi<Spec, Status>;
}

@autobind()
export abstract class KubeObjectStore<Spec, Status, T extends KubeObject<Spec, Status>> extends ItemStore<T> {
  @observable static defaultContext: ClusterContext; // TODO: support multiple cluster contexts

  abstract api: KubeApi<Spec, Status>;
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
    const namespaces = [namespace].flat();

    if (namespaces.length) {
      return this.items.filter(item => {
        const ns = item.getNs();

        return ns && namespaces.includes(ns);
      });
    } else if (!strict) {
      return this.items;
    }

    return [];
  }

  getById(id: string) {
    return this.items.find(item => item.getId() === id);
  }

  getByName(name?: string, namespace?: string): T | undefined {
    return this.items.find(item => {
      return item.getName() === name && (
        namespace ? item.getNs() === namespace : true
      );
    });
  }

  getByPath(path: string): T | undefined {
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

  protected async loadItems({ namespaces, api }: KubeObjectStoreLoadingParams<Spec, Status>): Promise<T[]> {
    if (api && this.context?.cluster?.isAllowedResource(api.kind)) {
      if (!api.isNamespaced) {
        return api.list({}, this.query) as Promise<T[]>;
      }

      const isLoadingAll = this.context.allNamespaces
        && this.context.allNamespaces?.length > 1
        && this.context.cluster.accessibleNamespaces?.length === 0
        && this.context.allNamespaces.every(ns => namespaces.includes(ns));

      if (isLoadingAll) {
        this.loadedNamespaces = [];

        return api.list({}, this.query) as Promise<T[]>;
      } else {
        this.loadedNamespaces = namespaces;

        return Promise // load resources per namespace
          .all(namespaces.map(namespace => api.list({ namespace }) as Promise<T[]>))
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
        this.mergeItems(items, { replace: true });
      }

      return items;
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

  protected async loadItem(params: { name?: string; namespace?: string }): Promise<T | undefined> {
    return this.api.get(params) as Promise<T | undefined>;
  }

  @action
  async load(params: { name?: string; namespace?: string }): Promise<T | undefined> {
    const { name, namespace } = params;
    let item = this.getByName(name, namespace);

    if (!item) {
      item = await this.loadItem(params);

      if (item) {
        this.items.push(item);
        this.items.replace(this.sortItems());
      }
    }

    return item;
  }

  @action
  async loadFromPath(resourcePath: string) {
    const { namespace, name } = parseKubeApi(resourcePath);

    return this.load({ name, namespace });
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<T>): Promise<T> {
    return this.api.create(params, data) as Promise<T>;
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
  protected eventsBuffer = observable.array<IKubeWatchEvent<KubeJsonApiData<Spec, Status>>>([], { deep: false });

  protected bindWatchEventsUpdater(delay = 1000) {
    reaction(() => this.eventsBuffer.length, this.updateFromEventsBuffer, {
      delay
    });
  }

  getSubscribeApis(): KubeApi<Spec, Status>[] {
    return [this.api];
  }

  subscribe(apis = this.getSubscribeApis()) {
    const abortController = new AbortController();
    const namespaces = [...this.loadedNamespaces];

    if (this.context.cluster?.isGlobalWatchEnabled && namespaces.length === 0) {
      apis.forEach(api => this.watchNamespace(api, "", abortController));
    } else {
      apis.forEach(api => {
        this.loadedNamespaces.forEach((namespace) => {
          this.watchNamespace(api, namespace, abortController);
        });
      });
    }

    return () => {
      abortController.abort();
    };
  }

  private watchNamespace(api: KubeApi<Spec, Status>, namespace: string, abortController: AbortController) {
    let timedRetry: NodeJS.Timeout;

    abortController.signal.addEventListener("abort", () => clearTimeout(timedRetry));

    const callback = (data?: IKubeWatchEvent, error?: any) => {
      if (!this.isLoaded || abortController.signal.aborted) return;

      if (error instanceof Response) {
        if (error.status === 404) {
          // api has gone, let's not retry
          return;
        } else { // not sure what to do, best to retry
          if (timedRetry) clearTimeout(timedRetry);
          timedRetry = setTimeout(() => {
            api.watch({
              namespace,
              abortController,
              callback
            });
          }, 5000);
        }
      } else if (error instanceof KubeStatus && error.code === 410) {
        if (timedRetry) clearTimeout(timedRetry);
        // resourceVersion has gone, let's try to reload
        timedRetry = setTimeout(() => {
          (namespace === "" ? this.loadAll({ merge: false }) : this.loadAll({namespaces: [namespace]})).then(() => {
            api.watch({
              namespace,
              abortController,
              callback
            });
          });
        }, 1000);
      } else if(error) { // not sure what to do, best to retry
        if (timedRetry) clearTimeout(timedRetry);

        timedRetry = setTimeout(() => {
          api.watch({
            namespace,
            abortController,
            callback
          });
        }, 5000);
      }

      if (data) {
        this.eventsBuffer.push(data);
      }
    };

    api.watch({
      namespace,
      abortController,
      callback: (data, error) => callback(data, error)
    });
  }

  @action
  protected updateFromEventsBuffer() {
    const items = this.items.toJS();

    for (const { type, object } of this.eventsBuffer.clear()) {
      if (!object) {
        continue;
      }

      const index = items.findIndex(item => item.getId() === object.metadata?.uid);
      const item = items[index];
      const api = apiManager.getApiByKind(object.kind, object.apiVersion);

      if (!api) {
        logger.warn("[KUBE-OBJECT-STORE]: Unable to find api by kind", { kind: object.kind, apiVersion: object.apiVersion });

        continue;
      }

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new api.objectConstructor(object) as T;

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
