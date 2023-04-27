/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, makeObservable, observable, reaction } from "mobx";
import type { Disposer } from "@k8slens/utilities";
import { waitUntilDefined, includes, rejectPromiseBy, object } from "@k8slens/utilities";
import type { KubeJsonApiDataFor, KubeObject } from "@k8slens/kube-object";
import { KubeStatus } from "@k8slens/kube-object";
import type { IKubeWatchEvent } from "./kube-watch-event";
import { ItemStore } from "../item.store";
import type { KubeApiQueryParams, KubeApi, KubeApiWatchCallback } from "./kube-api";
import { parseKubeApi } from "./kube-api-parse";
import type { RequestInit } from "@k8slens/node-fetch";
import type { Patch } from "rfc6902";
import type { Logger } from "../logger";
import assert from "assert";
import type { PartialDeep } from "type-fest";
import type { ClusterContext } from "../../renderer/cluster-frame-context/cluster-frame-context";
import autoBind from "auto-bind";

export type OnLoadFailure = (error: unknown) => void;

export interface KubeObjectStoreLoadingParams {
  namespaces: string[];
  reqInit?: RequestInit;

  /**
   * A function that is called when listing fails. If set then blocks errors
   * being rejected with
   */
  onLoadFailure?: OnLoadFailure;
}

export interface KubeObjectStoreLoadAllParams {
  namespaces?: string[];
  merge?: boolean;
  reqInit?: RequestInit;

  /**
   * A function that is called when listing fails. If set then blocks errors
   * being rejected with
   */
  onLoadFailure?: OnLoadFailure;
}

export interface KubeObjectStoreSubscribeParams {
  /**
   * A function that is called when listing fails. If set then blocks errors
   * being rejected with
   */
  onLoadFailure?: OnLoadFailure;

  /**
   * An optional parent abort controller
   */
  abortController?: AbortController;
}

export interface MergeItemsOptions {
  merge?: boolean;
  updateStore?: boolean;
  sort?: boolean;
  filter?: boolean;
  namespaces: string[];
}

export interface StatusProvider<K> {
  getStatuses(items: K[]): Record<string, number>;
}

export interface KubeObjectStoreOptions {
  limit?: number;
  bufferSize?: number;
}

export type KubeApiDataFrom<K extends KubeObject, A> = A extends KubeApi<K, infer D>
  ? D extends KubeJsonApiDataFor<K>
    ? D
    : never
  : never;

export type JsonPatch = Patch;

export interface KubeObjectStoreDependencies {
  readonly context: ClusterContext;
  readonly logger: Logger;
}

export class KubeObjectStore<
  K extends KubeObject = KubeObject,
  A extends KubeApi<K, D> = KubeApi<K, KubeJsonApiDataFor<K>>,
  D extends KubeJsonApiDataFor<K> = KubeApiDataFrom<K, A>,
> extends ItemStore<K> {
  public readonly limit: number | undefined;
  public readonly bufferSize: number;

  private readonly loadedNamespaces = observable.box<string[]>();

  constructor(
    protected readonly dependencies: KubeObjectStoreDependencies,
    public readonly api: A,
    opts?: KubeObjectStoreOptions,
  ) {
    super();
    this.limit = opts?.limit;
    this.bufferSize = opts?.bufferSize ?? 50_000;

    makeObservable(this);
    autoBind(this);
    this.bindWatchEventsUpdater();
  }

  // TODO: Circular dependency: KubeObjectStore -> ClusterFrameContext -> NamespaceStore -> KubeObjectStore
  @computed get contextItems(): K[] {
    const namespaces = this.dependencies.context.contextNamespaces;

    return this.items.filter(item => {
      const itemNamespace = item.getNs();

      return !itemNamespace /* cluster-wide */ || namespaces.includes(itemNamespace);
    });
  }

  getTotalCount(): number {
    return this.contextItems.length;
  }

  get query(): KubeApiQueryParams {
    const { limit } = this;

    if (!limit) {
      return {};
    }

    return { limit };
  }

  getAllByNs(namespace: string | string[], strict = false): K[] {
    const namespaces = [namespace].flat();

    if (namespaces.length) {
      return this.items.filter(item => includes(namespaces, item.getNs()));
    }

    if (!strict) {
      return this.items;
    }

    return [];
  }

  getById(id: string): K | undefined {
    return this.items.find(item => item.getId() === id);
  }

  getByName(name: string, namespace?: string): K | undefined {
    return this.items.find(item => {
      return item.getName() === name && (
        namespace ? item.getNs() === namespace : true
      );
    });
  }

  getByPath(path: string): K | undefined {
    return this.items.find(item => item.selfLink === path);
  }

  getByLabel(labels: string[] | Partial<Record<string, string>>): K[] {
    if (Array.isArray(labels)) {
      return this.items.filter((item: K) => {
        const itemLabels = item.getLabels();

        return labels.every(label => itemLabels.includes(label));
      });
    } else {
      return this.items.filter((item: K) => {
        const itemLabels = item.metadata.labels || {};

        return object.entries(labels)
          .every(([key, value]) => itemLabels[key] === value);
      });
    }
  }

  protected async loadItems({ namespaces, reqInit, onLoadFailure }: KubeObjectStoreLoadingParams): Promise<K[]> {
    const isLoadingAll = this.dependencies.context.isLoadingAll(namespaces);

    if (!this.api.isNamespaced || isLoadingAll) {
      if (this.api.isNamespaced) {
        this.loadedNamespaces.set([]);
      }

      const res = this.api.list({ reqInit }, this.query);

      if (onLoadFailure) {
        try {
          return await res ?? [];
        } catch (error) {
          onLoadFailure(new Error(`Failed to load ${this.api.apiBase}`, { cause: error }));

          // reset the store because we are loading all, so that nothing is displayed
          this.items.clear();
          this.selectedItemsIds.clear();

          return [];
        }
      }

      return await res ?? [];
    }

    this.loadedNamespaces.set(namespaces);

    const results = await Promise.allSettled(
      namespaces.map(namespace => this.api.list({ namespace, reqInit }, this.query)),
    );
    const res: K[] = [];

    for (const result of results) {
      switch (result.status) {
        case "fulfilled":
          res.push(...result.value ?? []);
          break;

        case "rejected":
          if (onLoadFailure) {
            onLoadFailure(new Error(`Failed to load ${this.api.apiBase}`, { cause: result.reason }));
          } else {
            // if onLoadFailure is not provided then preserve old behaviour
            throw result.reason;
          }
      }
    }

    return res;
  }

  protected filterItemsOnLoad(items: K[]) {
    return items;
  }

  @action
  async loadAll({ namespaces, merge = true, reqInit, onLoadFailure }: KubeObjectStoreLoadAllParams = {}): Promise<undefined | K[]> {
    namespaces ??= this.dependencies.context.contextNamespaces;
    this.isLoading = true;

    try {
      const items = await this.loadItems({ namespaces, reqInit, onLoadFailure });

      this.mergeItems(items, { merge, namespaces });

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

    return undefined;
  }

  @action
  async reloadAll(opts: { force?: boolean; namespaces?: string[]; merge?: boolean } = {}): Promise<undefined | K[]> {
    const { force = false, ...loadingOptions } = opts;

    if (this.isLoading || (this.isLoaded && !force)) {
      return undefined;
    }

    return this.loadAll(loadingOptions);
  }

  @action
  protected mergeItems(partialItems: K[], { merge = true, updateStore = true, sort = true, filter = true, namespaces }: MergeItemsOptions): K[] {
    let items = partialItems;

    // update existing items
    if (merge && this.api.isNamespaced) {
      const ns = new Set(namespaces);

      items = [
        ...this.items.filter(item => !ns.has(item.getNs() as string)),
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

  protected async loadItem(params: { name: string; namespace?: string }): Promise<K | null> {
    return this.api.get(params);
  }

  @action
  async load(params: { name: string; namespace?: string }): Promise<K> {
    const { name, namespace } = params;
    let item: K | null | undefined = this.getByName(name, namespace);

    if (!item) {
      item = await this.loadItem(params);
      assert(item, "Failed to load item from kube");
      const newItems = this.sortItems([...this.items, item]);

      this.items.replace(newItems);
    }

    return item;
  }

  @action
  async loadFromPath(resourcePath: string) {
    const parsedApi = parseKubeApi(resourcePath);

    assert(parsedApi, "resourcePath must be a valid kube api");

    const { namespace, name } = parsedApi;

    assert(name, "name must be part of resourcePath");

    return this.load({ name, namespace });
  }

  protected async createItem(params: { name: string; namespace?: string }, data?: PartialDeep<K>): Promise<K | null> {
    return this.api.create(params, data);
  }

  async create(params: { name: string; namespace?: string }, data?: PartialDeep<K>): Promise<K> {
    const newItem = await this.createItem(params, data);

    assert(newItem, "Failed to create item from kube");
    const items = this.sortItems([...this.items, newItem]);

    this.items.replace(items);

    return newItem;
  }

  private postUpdate(newItem: K): K {
    const index = this.items.findIndex(item => item.getId() === newItem.getId());

    if (index < 0) {
      this.items.push(newItem);
    } else {
      this.items[index] = newItem;
    }

    return newItem;
  }

  async patch(item: K, patch: JsonPatch): Promise<K> {
    const rawItem = await this.api.patch(
      {
        name: item.getName(), namespace: item.getNs(),
      },
      patch,
      "json",
    );

    assert(rawItem, `Failed to patch ${item.getScopedName()} of ${item.kind} ${item.apiVersion}`);

    return this.postUpdate(rawItem);
  }

  async update(item: K, data: PartialDeep<K>): Promise<K> {
    const rawItem = await this.api.update(
      {
        name: item.getName(),
        namespace: item.getNs(),
      },
      data,
    );

    assert(rawItem, `Failed to update ${item.getScopedName()} of ${item.kind} ${item.apiVersion}`);

    return this.postUpdate(rawItem);
  }

  async remove(item: K) {
    // Some k8s apis might implement special more fine-grained "delete" request for resources (e.g. pod.api.ts)
    // See also: https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/
    await this.api.evict({ name: item.getName(), namespace: item.getNs() });
    this.selectedItemsIds.delete(item.getId());
  }

  async removeSelectedItems() {
    await Promise.all(this.selectedItems.map(item => this.remove(item)));
  }

  async removeItems(items: K[]) {
    await Promise.all(items.map(item => this.remove(item)));
  }

  // collect items from watch-api events to avoid UI blowing up with huge streams of data
  protected readonly eventsBuffer = observable.array<IKubeWatchEvent<D>>([], { deep: false });

  protected bindWatchEventsUpdater(delay = 1000) {
    reaction(() => [...this.eventsBuffer], () => this.updateFromEventsBuffer(), {
      delay,
    });
  }

  subscribe({ onLoadFailure, abortController = new AbortController() }: KubeObjectStoreSubscribeParams = {}): Disposer {
    if (this.api.isNamespaced) {
      void (async () => {
        try {
          const loadedNamespaces = await Promise.race([
            rejectPromiseBy(abortController.signal),
            waitUntilDefined(() => this.loadedNamespaces.get()),
          ]);

          if (this.dependencies.context.isGlobalWatchEnabled() && loadedNamespaces.length === 0) {
            this.watchNamespace("", abortController, { onLoadFailure });
          } else {
            for (const namespace of loadedNamespaces) {
              this.watchNamespace(namespace, abortController, { onLoadFailure });
            }
          }
        } catch (error) {
          console.error(`[KUBE-OBJECT-STORE]: failed to subscribe to ${this.api.apiBase}`, error);
        }
      })();
    } else {
      this.watchNamespace("", abortController, { onLoadFailure });
    }

    return () => abortController.abort();
  }

  private watchNamespace(namespace: string, abortController: AbortController, opts: KubeObjectStoreSubscribeParams) {
    if (!this.api.getResourceVersion(namespace)) {
      return;
    }

    let timedRetry: NodeJS.Timeout;
    const startNewWatch = () => this.api.watch({
      namespace,
      abortController,
      callback,
    });

    const signal = abortController.signal;

    const callback: KubeApiWatchCallback<D> = (data, error) => {
      if (!this.isLoaded || (error as Record<string, unknown> | null)?.type === "aborted") return;

      if (error instanceof Response) {
        if (error.status === 404 || error.status === 401) {
          // api has gone, or credentials are not permitted, let's not retry
          return;
        }

        // not sure what to do, best to retry
        clearTimeout(timedRetry);
        timedRetry = setTimeout(startNewWatch, 5000);
      } else if (error instanceof KubeStatus && error.code === 410) {
        clearTimeout(timedRetry);
        // resourceVersion has gone, let's try to reload
        timedRetry = setTimeout(() => {
          void (
            namespace
              ? this.loadAll({ namespaces: [namespace], reqInit: { signal }, ...opts })
              : this.loadAll({ merge: false, reqInit: { signal }, ...opts })
          ).then(startNewWatch);
        }, 1000);
      } else if (error) { // not sure what to do, best to retry
        clearTimeout(timedRetry);
        timedRetry = setTimeout(startNewWatch, 5000);
      }

      if (data) {
        this.eventsBuffer.push(data);
      }
    };

    signal.addEventListener("abort", () => clearTimeout(timedRetry));
    startNewWatch();
  }

  @action
  protected updateFromEventsBuffer() {
    const items = this.getItems();

    for (const event of this.eventsBuffer.clear()) {
      if (event.type === "ERROR") {
        continue;
      }

      try {
        const { type, object } = event;

        if (!object.metadata?.uid) {
          this.dependencies.logger.warn("[KUBE-STORE]: watch event did not have defined .metadata.uid, skipping", { event });
          // Other parts of the code will break if this happens
          continue;
        }

        const index = items.findIndex(item => item.getId() === object.metadata.uid);
        const item = items[index];

        switch (type) {
          case "ADDED":

            // fallthrough
          case "MODIFIED": {
            const newItem = new this.api.objectConstructor(object);

            if (!item) {
              items.push(newItem);
            } else {
              items[index] = newItem;
            }

            break;
          }
          case "DELETED":
            if (item) {
              items.splice(index, 1);
            }
            break;
        }
      } catch (error) {
        this.dependencies.logger.error("[KUBE-STORE]: failed to handle event from watch buffer", { error, event });
      }
    }

    // update items
    this.items.replace(this.sortItems(items.slice(-this.bufferSize)));
  }
}
