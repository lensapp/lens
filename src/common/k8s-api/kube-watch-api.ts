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

import plimit from "p-limit";
import { comparer, observable, reaction, makeObservable } from "mobx";
import { autoBind, disposer, Disposer, noop } from "../utils";
import type { KubeApi } from "./kube-api";
import type { KubeJsonApiData } from "./kube-json-api";
import { isDebugging, isProduction } from "../vars";
import type { KubeObject } from "./kube-object";

export interface IKubeWatchEvent<T extends KubeJsonApiData> {
  type: "ADDED" | "MODIFIED" | "DELETED" | "ERROR";
  object?: T;
}

interface KubeWatchPreloadOptions {
  /**
   * The namespaces to watch
   * @default all-accessible
   */
  namespaces?: string[];

  /**
   * Whether to skip loading if the store is already loaded
   * @default false
   */
  loadOnce?: boolean;

  /**
   * A function that is called when listing fails. If set then blocks errors
   * being rejected with
   */
  onLoadFailure?: (err: any) => void;
}

export interface KubeWatchSubscribeStoreOptions extends KubeWatchPreloadOptions {
  /**
   * Whether to subscribe only after loading all stores
   * @default true
   */
  waitUntilLoaded?: boolean;

  /**
   * Whether to preload the stores before watching
   * @default true
   */
  preload?: boolean;
}

export interface IKubeWatchLog {
  message: string | string[] | Error;
  meta?: object;
  cssStyle?: string;
}

export class KubeWatchApi {
  @observable context: ClusterContext = null;

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  isAllowedApi(api: KubeApi<KubeObject>): boolean {
    return Boolean(this.context?.cluster.isAllowedResource(api.kind));
  }

  preloadStores(stores: KubeObjectStore<KubeObject>[], { loadOnce, namespaces, onLoadFailure }: KubeWatchPreloadOptions = {}) {
    const limitRequests = plimit(1); // load stores one by one to allow quick skipping when fast clicking btw pages
    const preloading: Promise<any>[] = [];

    for (const store of stores) {
      preloading.push(limitRequests(async () => {
        if (store.isLoaded && loadOnce) return; // skip

        return store.loadAll({ namespaces, onLoadFailure });
      }));
    }

    return {
      loading: Promise.allSettled(preloading),
      cancelLoading: () => limitRequests.clearQueue(),
    };
  }

  subscribeStores(stores: KubeObjectStore<KubeObject>[], opts: KubeWatchSubscribeStoreOptions = {}): Disposer {
    const { preload = true, waitUntilLoaded = true, loadOnce = false, onLoadFailure } = opts;
    const subscribingNamespaces = opts.namespaces ?? this.context?.allNamespaces ?? [];
    const unsubscribeStores = disposer();
    let isUnsubscribed = false;

    const load = (namespaces = subscribingNamespaces) => this.preloadStores(stores, { namespaces, loadOnce, onLoadFailure });
    let preloading = preload && load();
    let cancelReloading: Disposer = noop;

    const subscribe = () => {
      if (isUnsubscribed) {
        return;
      }

      unsubscribeStores.push(...stores.map(store => store.subscribe({ onLoadFailure })));
    };

    if (preloading) {
      if (waitUntilLoaded) {
        preloading.loading.then(subscribe, error => {
          this.log({
            message: new Error("Loading stores has failed"),
            meta: { stores, error, options: opts },
          });
        });
      } else {
        subscribe();
      }

      // reload stores only for context namespaces change
      cancelReloading = reaction(() => this.context?.contextNamespaces, namespaces => {
        preloading?.cancelLoading();
        unsubscribeStores();
        preloading = load(namespaces);
        preloading.loading.then(subscribe);
      }, {
        equals: comparer.shallow,
      });
    }

    // unsubscribe
    return () => {
      if (isUnsubscribed) return;
      isUnsubscribed = true;
      cancelReloading();
      preloading?.cancelLoading();
      unsubscribeStores();
    };
  }

  protected log({ message, cssStyle = "", meta = {}}: IKubeWatchLog) {
    if (isProduction && !isDebugging) {
      return;
    }

    const logInfo = [`%c[KUBE-WATCH-API]:`, `font-weight: bold; ${cssStyle}`, message].flat().map(String);
    const logMeta = {
      time: new Date().toLocaleString(),
      ...meta,
    };

    if (message instanceof Error) {
      console.error(...logInfo, logMeta);
    } else {
      console.info(...logInfo, logMeta);
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
