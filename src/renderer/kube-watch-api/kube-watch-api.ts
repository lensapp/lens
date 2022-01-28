/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { comparer, reaction } from "mobx";
import { disposer, Disposer, noop } from "../../common/utils";
import type { KubeObject } from "../../common/k8s-api/kube-object";
import AbortController from "abort-controller";
import { once } from "lodash";
import type { FrameContext } from "../cluster-frame-context/cluster-frame-context";
import type { KubeObjectStore } from "../../common/k8s-api/kube-object.store";
import logger from "../../common/logger";

// Kubernetes watch-api client
// API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

class WrappedAbortController extends AbortController {
  constructor(protected parent: AbortController) {
    super();

    parent.signal.addEventListener("abort", () => {
      this.abort();
    });
  }
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

    logger.info(`[KUBE-WATCH-API]: inc() count for ${store.api.objectConstructor.apiBase} is now ${newCount}`);
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

interface Dependencies {
  clusterFrameContext: FrameContext;
}

export class KubeWatchApi {
  #watch = new WatchCount();

  constructor(private dependencies: Dependencies) {}

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
        () => [this.dependencies.clusterFrameContext.contextNamespaces.slice(), this.dependencies.clusterFrameContext.hasSelectedAll] as const,
        ([namespaces, curSelectedAll], [prevNamespaces, prevSelectedAll]) => {
          if (curSelectedAll && prevSelectedAll) {
            const action = namespaces.length > prevNamespaces.length ? "created" : "deleted";

            return console.debug(`[KUBE-WATCH-API]: Not changing watch for ${store.api.apiBase} because a new namespace was ${action} but all namespaces are selected`);
          }

          console.log(`[KUBE-WATCH-API]: changing watch ${store.api.apiBase}`, namespaces);
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

  subscribeStores = (stores: KubeObjectStore<KubeObject>[], { namespaces, onLoadFailure }: KubeWatchSubscribeStoreOptions = {}): Disposer => {
    const parent = new AbortController();
    const unsubscribe = disposer(
      ...stores.map(store => this.subscribeStore({
        store,
        parent,
        watchChanges: !namespaces && store.api.isNamespaced,
        namespaces: namespaces ?? this.dependencies.clusterFrameContext?.contextNamespaces ?? [],
        onLoadFailure,
      })),
    );

    // unsubscribe
    return once(() => {
      parent.abort();
      unsubscribe();
    });
  };

  protected log(message: any, meta: any) {
    const log = message instanceof Error
      ? console.error
      : console.debug;

    log("[KUBE-WATCH-API]:", message, {
      time: new Date().toLocaleString(),
      ...meta,
    });
  }
}
