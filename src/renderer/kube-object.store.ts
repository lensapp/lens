/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { ClusterContext } from "./components/context";

import { action, computed, makeObservable, observable, reaction, when } from "mobx";
import { autoBind, bifurcateArray, noop, rejectPromiseBy } from "./utils";
import { KubeObject, KubeStatus } from "./api/kube-object";
import type { IKubeWatchEvent } from "./api/kube-watch-api";
import { ItemStore } from "./item.store";
import { apiManager } from "./api/api-manager";
import { ensureObjectSelfLink, IKubeApiQueryParams, KubeApi, parseKubeApi } from "./api/kube-api";
import type { KubeJsonApiData } from "./api/kube-json-api";
import { Notifications } from "./components/notifications";

export interface KubeObjectStoreLoadingParams<K extends KubeObject> {
  namespaces: string[];
  api?: KubeApi<K>;
  reqInit?: RequestInit;
}

export abstract class KubeObjectStore<K extends KubeObject> extends ItemStore<K> {
  static defaultContext = observable.box<ClusterContext>(); // TODO: support multiple cluster contexts

  abstract api: KubeApi<K>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;
  @observable private loadedNamespaces?: string[];

  get contextReady() {
    return when(() => Boolean(this.context));
  }

  get namespacesReady() {
    return when(() => Boolean(this.loadedNamespaces));
  }

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);
    this.bindWatchEventsUpdater();
  }

  get context(): ClusterContext {
    return KubeObjectStore.defaultContext.get();
  }

  @computed get contextItems(): K[] {
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

  getStatuses?(items: K[]): Record<string, number>;

  getAllByNs(namespace: string | string[], strict = false): K[] {
    const namespaces: string[] = [].concat(namespace);

    if (namespaces.length) {
      return this.items.filter(item => namespaces.includes(item.getNs()));
    }

    if (!strict) {
      return this.items;
    }

    return [];
  }

  getById(id: string) {
    return this.items.find(item => item.getId() === id);
  }

  getByName(name: string, namespace?: string): K {
    return this.items.find(item => {
      return item.getName() === name && (
        namespace ? item.getNs() === namespace : true
      );
    });
  }

  getByPath(path: string): K {
    return this.items.find(item => item.selfLink === path);
  }

  getByLabel(labels: string[] | { [label: string]: string }): K[] {
    if (Array.isArray(labels)) {
      return this.items.filter((item: K) => {
        const itemLabels = item.getLabels();

        return labels.every(label => itemLabels.includes(label));
      });
    } else {
      return this.items.filter((item: K) => {
        const itemLabels = item.metadata.labels || {};

        return Object.entries(labels)
          .every(([key, value]) => itemLabels[key] === value);
      });
    }
  }

  protected async loadItems({ namespaces, api, reqInit }: KubeObjectStoreLoadingParams<K>): Promise<K[]> {
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

  protected filterItemsOnLoad(items: K[]) {
    return items;
  }

  @action
  async loadAll(options: { namespaces?: string[], merge?: boolean, reqInit?: RequestInit } = {}): Promise<void | K[]> {
    await this.contextReady;
    this.isLoading = true;

    try {
      const {
        namespaces = this.context.allNamespaces, // load all namespaces by default
        merge = true, // merge loaded items or return as result
        reqInit,
      } = options;

      const items = await this.loadItems({ namespaces, api: this.api, reqInit });

      if (merge) {
        this.mergeItems(items, { replace: false });
      } else {
        this.mergeItems(items, { replace: true });
      }

      this.isLoaded = true;
      this.failedLoading = false;

      return items;
    } catch (error) {
      if (error.message) {
        Notifications.error(error.message);
      }
      console.error("Loading store items failed", { error });
      this.resetOnError(error);
      this.failedLoading = true;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async reloadAll(opts: { force?: boolean, namespaces?: string[], merge?: boolean } = {}) {
    const { force = false, ...loadingOptions } = opts;

    if (this.isLoading || (this.isLoaded && !force)) {
      return;
    }

    return this.loadAll(loadingOptions);
  }

  @action
  protected mergeItems(partialItems: K[], { replace = false, updateStore = true, sort = true, filter = true } = {}): K[] {
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

  protected async loadItem(params: { name: string; namespace?: string }): Promise<K> {
    return this.api.get(params);
  }

  @action
  async load(params: { name: string; namespace?: string }): Promise<K> {
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

  protected async createItem(params: { name: string; namespace?: string }, data?: Partial<K>): Promise<K> {
    return this.api.create(params, data);
  }

  async create(params: { name: string; namespace?: string }, data?: Partial<K>): Promise<K> {
    const newItem = await this.createItem(params, data);
    const items = this.sortItems([...this.items, newItem]);

    this.items.replace(items);

    return newItem;
  }

  async update(item: K, data: Partial<K>): Promise<K> {
    const newItem = await item.update(data);

    ensureObjectSelfLink(this.api, newItem);

    const index = this.items.findIndex(item => item.getId() === newItem.getId());

    this.items.splice(index, 1, newItem);

    return newItem;
  }

  async remove(item: K) {
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

  getSubscribeApis(): KubeApi<KubeObject>[] {
    // TODO remove this function, each Store should only be a single API
    return [this.api];
  }

  subscribe(apis = this.getSubscribeApis()) {
    const abortController = new AbortController();
    const [clusterScopedApis, namespaceScopedApis] = bifurcateArray(apis, api => api.isNamespaced);

    for (const api of namespaceScopedApis) {
      const store = apiManager.getStore(api);

      // This waits for the context and namespaces to be ready or fails fast if the disposer is called
      Promise.race([rejectPromiseBy(abortController.signal), Promise.all([store.contextReady, store.namespacesReady])])
        .then(() => {
          if (
            store.context.cluster.isGlobalWatchEnabled
            && store.loadedNamespaces.length === 0
          ) {
            return store.watchNamespace(api, "", abortController);
          }

          for (const namespace of this.loadedNamespaces) {
            store.watchNamespace(api, namespace, abortController);
          }
        })
        .catch(noop); // ignore DOMExceptions
    }

    for (const api of clusterScopedApis) {
      /**
       * if the api is cluster scoped then we will never assign to `loadedNamespaces`
       * and thus `store.namespacesReady` will never resolve. Futhermore, we don't care
       * about watching namespaces.
       */
      apiManager.getStore(api).watchNamespace(api, "", abortController);
    }

    return () => {
      abortController.abort();
    };
  }

  private watchNamespace(api: KubeApi<K>, namespace: string, abortController: AbortController) {
    let timedRetry: NodeJS.Timeout;
    const watch = () => api.watch({
      namespace,
      abortController,
      callback
    });

    const { signal } = abortController;

    const callback = (data: IKubeWatchEvent<K>, error: any) => {
      if (!this.isLoaded || error instanceof DOMException) return;

      if (error instanceof Response) {
        if (error.status === 404) {
          // api has gone, let's not retry
          return;
        }

        // not sure what to do, best to retry
        clearTimeout(timedRetry);
        timedRetry = setTimeout(watch, 5000);
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
    const items = this.getItems();

    for (const { type, object } of this.eventsBuffer.clear()) {
      const index = items.findIndex(item => item.getId() === object.metadata?.uid);
      const item = items[index];
      const api = apiManager.getApiByKind(object.kind, object.apiVersion);

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new api.objectConstructor(object) as K;

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
