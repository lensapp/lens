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
import { autoBind, Disposer, noop } from "../utils";
import type { KubeApi } from "./kube-api";
import type { KubeJsonApiData } from "./kube-json-api";
import { isDebugging, isProduction } from "../vars";
import type { KubeObject } from "./kube-object";

export interface IKubeWatchEvent<T extends KubeJsonApiData> {
  type: "ADDED" | "MODIFIED" | "DELETED" | "ERROR";
  object?: T;
}

export interface IKubeWatchSubscribeStoreOptions {
  namespaces?: string[]; // default: all accessible namespaces
  preload?: boolean; // preload store items, default: true
  waitUntilLoaded?: boolean; // subscribe only after loading all stores, default: true
  loadOnce?: boolean; // check store.isLoaded to skip loading if done already, default: false
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

  preloadStores(stores: KubeObjectStore<KubeObject>[], opts: { namespaces?: string[], loadOnce?: boolean } = {}) {
    const limitRequests = plimit(1); // load stores one by one to allow quick skipping when fast clicking btw pages
    const preloading: Promise<any>[] = [];

    for (const store of stores) {
      preloading.push(limitRequests(async () => {
        if (store.isLoaded && opts.loadOnce) return; // skip

        return store.loadAll({ namespaces: opts.namespaces });
      }));
    }

    return {
      loading: Promise.allSettled(preloading),
      cancelLoading: () => limitRequests.clearQueue(),
    };
  }

  subscribeStores(stores: KubeObjectStore<KubeObject>[], opts: IKubeWatchSubscribeStoreOptions = {}): Disposer {
    const { preload = true, waitUntilLoaded = true, loadOnce = false } = opts;
    const subscribingNamespaces = opts.namespaces ?? this.context?.allNamespaces ?? [];
    const unsubscribeList: Function[] = [];
    let isUnsubscribed = false;

    const load = (namespaces = subscribingNamespaces) => this.preloadStores(stores, { namespaces, loadOnce });
    let preloading = preload && load();
    let cancelReloading: Disposer = noop;

    const subscribe = () => {
      if (isUnsubscribed) return;

      stores.forEach((store) => {
        unsubscribeList.push(store.subscribe());
      });
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
        unsubscribeList.forEach(unsubscribe => unsubscribe());
        unsubscribeList.length = 0;
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
      unsubscribeList.forEach(unsubscribe => unsubscribe());
      unsubscribeList.length = 0;
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
