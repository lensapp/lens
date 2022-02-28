/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStore } from "./kube-object.store";

import { action, observable, makeObservable } from "mobx";
import { autoBind, iter } from "../utils";
import type { KubeApi } from "./kube-api";
import type { KubeObject } from "./kube-object";
import { IKubeObjectRef, parseKubeApi, createKubeApiURL } from "./kube-api-parse";

/**
 * The manager of registered kube apis and KubeObject stores
 */
export class ApiManager {
  private apis = observable.map<string, KubeApi<KubeObject>>();
  private stores = observable.map<KubeApi<KubeObject>, KubeObjectStore<KubeObject>>();

  /**
   * @internal
   */
  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  /**
   * Get the KubeApi instance which either has registered under the given
   * path or by the apiBase of the given path or the first api which the
   * callback returns `true` for.
   * @param pathOrCallback Either the api path or a matching function
   */
  getApi(pathOrCallback: string | ((api: KubeApi<KubeObject>) => boolean)): KubeApi<KubeObject> | undefined {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
    }

    return iter.find(this.apis.values(), pathOrCallback);
  }

  /**
   * Get the `KubeApi` instance which is for the kube resource `kind` under the
   * apiVersion and group `apiVersion`
   *
   * Example:
   * ```ts
   * this.getApiByKind("Pod", "api/v1");
   * ```
   * @param kind The kube resource kind
   * @param apiVersion The kube apiVersion and group
   */
  getApiByKind(kind: string, apiVersion: string): KubeApi<KubeObject> | undefined {
    return this.getApi(api => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  /**
   * Attempt to register `api` under `apiBase`. If `apiBase` already has been
   * registered then this function does nothing.
   * @param apiBase The kube resource api base to register the api against
   * @param api The `KubeApi` instance to register
   */
  registerApi(apiBase: string, api: KubeApi<KubeObject>): void {
    if (!api.apiBase || this.apis.has(apiBase)) {
      return;
    }

    this.apis.set(apiBase, api);
  }

  /**
   * Unifies apiBases and instances into instances
   * @param apiOrBase Either the `apiBase` string or the `KubeApi` instance
   */
  protected resolveApi<K extends KubeObject>(apiOrBase: string | KubeApi<K>): KubeApi<K> | undefined {
    if (!apiOrBase) {
      return undefined;
    }

    if (typeof apiOrBase === "string") {
      return this.getApi(apiOrBase) as KubeApi<K>;
    }

    return apiOrBase;
  }

  /**
   * Removes
   * @param apiOrBase Either an apiBase string or the instance to deregister
   */
  unregisterApi(apiOrBase: string | KubeApi<KubeObject>) {
    if (typeof apiOrBase === "string") {
      this.apis.delete(apiOrBase);
    } else {
      for (const [apiBase, api] of this.apis) {
        if (api === apiOrBase) {
          this.apis.delete(apiBase);
        }
      }
    }
  }

  /**
   * Register a store under its api's apiBase
   * @param store The store instance to register
   */
  registerStore(store: KubeObjectStore<KubeObject>): void;
  /**
   * @deprecated Use {@link ApiManager.registerStore} instead as a store should
   * only be registered under its own api
   */
  registerStore(store: KubeObjectStore<KubeObject>, apis: KubeApi<KubeObject>[]): void;
  @action
  registerStore(store: KubeObjectStore<KubeObject>, apis?: KubeApi<KubeObject>[]): void {
    if (apis) {
      for (const api of apis) {
        this.stores.set(api, store);
      }
    } else {
      this.stores.set(store.api, store);
    }
  }

  /**
   * Get the registered store under the provided key
   * @param apiOrBase Either the apiBase or a KubeApi instance
   */
  getStore<S extends KubeObjectStore<KubeObject>>(apiOrBase: string | KubeApi<KubeObject>): S | undefined {
    return this.stores.get(this.resolveApi(apiOrBase)) as S;
  }

  /**
   * Attempt to get the api string for a given kube resource
   * @param ref An object describing the kube resource
   * @param parentObject Used to get the namespace or the resource if `ref` does not provided it
   * @returns The kube API resource string
   */
  lookupApiLink(ref: IKubeObjectRef, parentObject?: KubeObject): string {
    const {
      kind, apiVersion, name,
      namespace = parentObject?.getNs(),
    } = ref;

    // search in registered apis by 'kind' & 'apiVersion'
    const api = this.getApi(api => api.kind === kind && api.apiVersionWithGroup == apiVersion);

    if (api) {
      return api.getUrl({ namespace, name });
    }

    // lookup api by generated resource link
    const apiPrefixes = ["/apis", "/api"];
    const resource = kind.endsWith("s") ? `${kind.toLowerCase()}es` : `${kind.toLowerCase()}s`;

    for (const apiPrefix of apiPrefixes) {
      const apiLink = createKubeApiURL({ apiPrefix, apiVersion, name, namespace, resource });

      if (this.getApi(apiLink)) {
        return apiLink;
      }
    }

    // resolve by kind only (hpa's might use refs to older versions of resources for example)
    const apiByKind = this.getApi(api => api.kind === kind);

    if (apiByKind) {
      return apiByKind.getUrl({ name, namespace });
    }

    // otherwise generate link with default prefix
    // resource still might exists in k8s, but api is not registered in the app
    return createKubeApiURL({ apiVersion, name, namespace, resource });
  }
}

/**
 * The single instance per frame.
 */
export const apiManager = new ApiManager();
