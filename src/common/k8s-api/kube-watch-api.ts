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

import { comparer, observable, reaction, makeObservable } from "mobx";
import { autoBind, disposer, Disposer, ExtendedMap, noop } from "../utils";
import type { KubeJsonApiData } from "./kube-json-api";
import { isProduction } from "../vars";
import type { KubeObject } from "./kube-object";
import AbortController from "abort-controller";
import { once } from "lodash";

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
   * The namespaces to watch, if not specified then changes to the set of
   * selected namespaces will be watched as well
   *
   * @default all selected namespaces
   */
  namespaces?: string[];
}

export class KubeWatchApi {
  @observable context: ClusterContext = null;
  duplicateWatchSet = new ExtendedMap<KubeObjectStore<KubeObject>, number>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  private subscribeStore(store: KubeObjectStore<KubeObject>, parent: AbortController, watchChanges: boolean, namespaces: string[]): Disposer {
    const count = this.duplicateWatchSet.getOrInsert(store, () => 1);

    if (count > 1) {
      // don't load or subscribe to a store more than once
      return () => {
        this.duplicateWatchSet.set(store, this.duplicateWatchSet.get(store) - 1);
      };
    }

    let childController = new WrappedAbortController(parent);
    const unsubscribe = disposer();

    const loadThenSubscribe = async (namespaces: string[]) => {
      try {
        await store.loadAll({ namespaces, reqInit: { signal: childController.signal }});
        unsubscribe.push(store.subscribe(childController));
      } catch (error) {
        if (!(error instanceof DOMException)) {
          this.log(Object.assign(new Error("Loading stores has failed"), { cause: error }), {
            meta: { store, namespaces },
          });
        }
      }
    };

    loadThenSubscribe(namespaces);

    const cancelReloading = watchChanges
      ? noop // don't watch namespaces if namespaces were provided
      : reaction(() => this.context.contextNamespaces, namespaces => {
        childController.abort();
        unsubscribe();
        childController = new WrappedAbortController(parent);
        loadThenSubscribe(namespaces);
      }, {
        equals: comparer.shallow,
      });

    return () => {
      const newCount = this.duplicateWatchSet.get(store) - 1;

      this.duplicateWatchSet.set(store, newCount);

      if (newCount === 0) {
        cancelReloading();
        childController.abort();
        unsubscribe();
      }
    };
  }

  subscribeStores(stores: KubeObjectStore<KubeObject>[], options: KubeWatchSubscribeStoreOptions = {}): Disposer {
    const parent = new AbortController();
    const unsubscribe = disposer(
      ...stores.map(store => this.subscribeStore(
        store,
        parent,
        !options.namespaces,
        options.namespaces ?? this.context?.contextNamespaces ?? [],
      )),
    );

    // unsubscribe
    return once(() => {
      parent.abort();
      unsubscribe();
    });
  }

  protected log(message: any, meta: any) {
    if (isProduction) {
      return;
    }

    const log = message instanceof Error
      ? console.error
      : console.debug;

    log("[KUBE-WATCH-API]:", message, {
      time: new Date().toLocaleString(),
      ...meta,
    });
  }
}

export const kubeWatchApi = new KubeWatchApi();
