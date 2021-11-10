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

// Kubernetes watch-api client
// API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

import type { KubeObjectStore } from "./kube-object.store";
import type { ClusterContext } from "./cluster-context";

import { comparer, reaction } from "mobx";
import { disposer, Disposer, noop } from "../utils";
import type { KubeJsonApiData } from "./kube-json-api";
import type { KubeObject } from "./kube-object";
import AbortController from "abort-controller";
import { once } from "lodash";
import logger from "../logger";

class WrappedAbortController extends AbortController {
  constructor(protected parent: AbortController) {
    super();

    parent.signal.addEventListener("abort", () => {
      this.abort();
    });
  }
}

export interface IKubeWatchEvent<T extends KubeJsonApiData> {
  type: "ADDED" | "MODIFIED" | "DELETED" | "ERROR";
  object?: T;
}

export interface KubeWatchSubscribeStoreOptions {
  /**
   * The namespaces to watch
   * @default all selected namespaces
   */
  namespaces?: string[];

  /**
   * A function that is called when listing fails. If set then blocks errors
   * being rejected with
   */
  onLoadFailure?: (err: any) => void;
}

export interface IKubeWatchLog {
  message: string | string[] | Error;
  meta?: object;
  cssStyle?: string;
}

interface SubscribeStoreParams {
  store: KubeObjectStore<KubeObject>;
  parent: AbortController;
  watchChanges: boolean;
  namespaces: string[];
  onLoadFailure?: (err: any) => void;
}

class WatchCount {
  #data = new Map<KubeObjectStore<KubeObject>, number>();

  public inc(store: KubeObjectStore<KubeObject>): number {
    if (!this.#data.has(store)) {
      this.#data.set(store, 0);
    }

    const newCount = this.#data.get(store) + 1;

    logger.debug(`[KUBE-WATCH-API]: inc() count for ${store.api.objectConstructor.apiBase} is now ${newCount}`);
    this.#data.set(store, newCount);

    return newCount;
  }

  public dec(store: KubeObjectStore<KubeObject>): number {
    if (!this.#data.has(store)) {
      throw new Error(`Cannot dec count for store that has never been inc: ${store.api.objectConstructor.kind}`);
    }

    const newCount = this.#data.get(store) - 1;

    if (newCount < 0) {
      throw new Error(`Cannot dec count more times than it has been inc: ${store.api.objectConstructor.kind}`);
    }

    logger.debug(`[KUBE-WATCH-API]: dec() count for ${store.api.objectConstructor.apiBase} is now ${newCount}`);
    this.#data.set(store, newCount);

    return newCount;
  }
}

export class KubeWatchApi {
  static context: ClusterContext = null;

  #watch = new WatchCount();

  private subscribeStore({ store, parent, watchChanges, namespaces, onLoadFailure }: SubscribeStoreParams): Disposer {
    if (this.#watch.inc(store) > 1) {
      // don't load or subscribe to a store more than once
      return () => this.#watch.dec(store);
    }

    let childController = new WrappedAbortController(parent);
    const unsubscribe = disposer();

    const loadThenSubscribe = async (namespaces: string[]) => {
      try {
        await store.loadAll({ namespaces, reqInit: { signal: childController.signal }, onLoadFailure });
        unsubscribe.push(store.subscribe({ onLoadFailure, abortController: childController }));
      } catch (error) {
        if (!(error instanceof DOMException)) {
          this.log(Object.assign(new Error("Loading stores has failed"), { cause: error }), {
            meta: { store, namespaces },
          });
        }
      }
    };

    /**
     * We don't want to wait because we want to start reacting to namespace
     * selection changes ASAP
     */
    loadThenSubscribe(namespaces).catch(noop);

    const cancelReloading = watchChanges
      ? reaction(
        // Note: must slice because reaction won't fire if it isn't there
        () => [KubeWatchApi.context.contextNamespaces.slice(), KubeWatchApi.context.hasSelectedAll] as const,
        ([namespaces, curSelectedAll], [prevNamespaces, prevSelectedAll]) => {
          if (curSelectedAll && prevSelectedAll) {
            const action = namespaces.length > prevNamespaces.length ? "created" : "deleted";

            return this.log(`[KUBE-WATCH-API]: Not changing watch for ${store.api.apiBase} because a new namespace was ${action} but all namespaces are selected`);
          }

          this.log(`[KUBE-WATCH-API]: changing watch ${store.api.apiBase}`, namespaces);
          childController.abort();
          unsubscribe();
          childController = new WrappedAbortController(parent);
          loadThenSubscribe(namespaces).catch(noop);
        },
        {
          equals: comparer.shallow,
        },
      )
      : noop; // don't watch namespaces if namespaces were provided

    return () => {
      if (this.#watch.dec(store) === 0) {
        // only stop the subcribe if this is the last one
        cancelReloading();
        childController.abort();
        unsubscribe();
      }
    };
  }

  subscribeStores(stores: KubeObjectStore<KubeObject>[], { namespaces, onLoadFailure }: KubeWatchSubscribeStoreOptions = {}): Disposer {
    const parent = new AbortController();
    const unsubscribe = disposer(
      ...stores.map(store => this.subscribeStore({
        store,
        parent,
        watchChanges: !namespaces && store.api.isNamespaced,
        namespaces: namespaces ?? KubeWatchApi.context?.contextNamespaces ?? [],
        onLoadFailure,
      })),
    );

    // unsubscribe
    return once(() => {
      parent.abort();
      unsubscribe();
    });
  }

  protected log(message: any, meta: object = {}) {
    const log = message instanceof Error
      ? logger.error
      : logger.debug;

    log("[KUBE-WATCH-API]:", message, {
      time: new Date().toLocaleString(),
      ...meta,
    });
  }
}

export const kubeWatchApi = new KubeWatchApi();
