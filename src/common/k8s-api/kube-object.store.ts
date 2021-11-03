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

import type { ClusterContext } from "./cluster-context";

import { action, computed, makeObservable, observable, reaction, when } from "mobx";
import { autoBind, noop, rejectPromiseBy } from "../utils";
import { KubeObject, KubeStatus } from "./kube-object";
import type { IKubeWatchEvent } from "./kube-watch-api";
import { ItemStore } from "../item.store";
import { ensureObjectSelfLink, IKubeApiQueryParams, KubeApi } from "./kube-api";
import { parseKubeApi } from "./kube-api-parse";
import type { KubeJsonApiData } from "./kube-json-api";
import type { RequestInit } from "node-fetch";
import AbortController from "abort-controller";
import type { Patch } from "rfc6902";

export interface KubeObjectStoreLoadingParams<K extends KubeObject> {
  namespaces: string[];
  api?: KubeApi<K>;
  reqInit?: RequestInit;
}

export abstract class KubeObjectStore<T extends KubeObject> extends ItemStore<T> {
  static defaultContext = observable.box<ClusterContext>(); // TODO: support multiple cluster contexts

  public api: KubeApi<T>;
  public readonly limit?: number;
  public readonly bufferSize: number = 50000;
  @observable private loadedNamespaces?: string[];

  get contextReady() {
    return when(() => Boolean(this.context));
  }

  get namespacesReady() {
    return when(() => Boolean(this.loadedNamespaces));
  }

  constructor(api?: KubeApi<T>) {
    super();
    if (api) this.api = api;

    makeObservable(this);
    autoBind(this);
    this.bindWatchEventsUpdater();
  }

  get context(): ClusterContext {
    return KubeObjectStore.defaultContext.get();
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
    }

    if (!strict) {
      return this.items;
    }

    return [];
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

  protected async loadItems({ namespaces, api, reqInit }: KubeObjectStoreLoadingParams<T>): Promise<T[]> {
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
          .all(namespaces.map(namespace => api.list({ namespace, reqInit }, this.query)))
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

      if (merge) {
        this.mergeItems(items, { replace: false });
      } else {
        this.mergeItems(items, { replace: true });
      }

      this.isLoaded = true;
      this.failedLoading = false;

      return items;
    } catch (error) {
      console.warn("[KubeObjectStore] loadAll failed", this.api.apiBase, error);
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

  private postUpdate(rawItem: KubeJsonApiData): T {
    const newItem = new this.api.objectConstructor(rawItem);
    const index = this.items.findIndex(item => item.getId() === newItem.getId());

    ensureObjectSelfLink(this.api, newItem);

    if (index < 0) {
      this.items.push(newItem);
    } else {
      this.items[index] = newItem;
    }

    return newItem;
  }

  async patch(item: T, patch: Patch): Promise<T> {
    return this.postUpdate(await item.patch(patch));
  }

  async update(item: T, data: Partial<T>): Promise<T> {
    return this.postUpdate(await item.update(data));
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
      delay,
    });
  }

  subscribe() {
    const abortController = new AbortController();

    if (this.api.isNamespaced) {
      Promise.race([rejectPromiseBy(abortController.signal), Promise.all([this.contextReady, this.namespacesReady])])
        .then(() => {
          if (this.context.cluster.isGlobalWatchEnabled && this.loadedNamespaces.length === 0) {
            return this.watchNamespace("", abortController);
          }

          for (const namespace of this.loadedNamespaces) {
            this.watchNamespace(namespace, abortController);
          }
        })
        .catch(noop); // ignore DOMExceptions
    } else {
      this.watchNamespace("", abortController);
    }

    return () => abortController.abort();
  }

  private watchNamespace(namespace: string, abortController: AbortController) {
    if (!this.api.getResourceVersion(namespace)) {
      return;
    }

    let timedRetry: NodeJS.Timeout;
    const watch = () => this.api.watch({
      namespace,
      abortController,
      callback,
    });

    const { signal } = abortController;

    const callback = (data: IKubeWatchEvent<T>, error: any) => {
      if (!this.isLoaded || error?.type === "aborted") return;

      if (error instanceof Response) {
        if (error.status === 404 || error.status === 401) {
          // api has gone, or credentials are not permitted, let's not retry
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
              ? this.loadAll({ namespaces: [namespace], reqInit: { signal }})
              : this.loadAll({ merge: false, reqInit: { signal }})
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

      switch (type) {
        case "ADDED":
        case "MODIFIED":
          const newItem = new this.api.objectConstructor(object);

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
