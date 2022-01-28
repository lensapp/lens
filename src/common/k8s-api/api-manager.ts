/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStore } from "./kube-object.store";

import { action, observable, makeObservable, computed } from "mobx";
import { autoBind, iter } from "../utils";
import type { KubeApi } from "./kube-api";
import type { KubeObject } from "./kube-object";
import { IKubeObjectRef, parseKubeApi, createKubeApiURL } from "./kube-api-parse";

export class ApiManager {
  private apiSet = observable.set<KubeApi<KubeObject>>();
  private stores = observable.map<KubeApi<KubeObject>, KubeObjectStore<KubeObject>>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  /**
   * The private `apiBase` mapping of api instances. This is computed so that
   * it can react to changes in the instances' apiBase fields.
   */
  @computed private get apis() {
    const res = new Map<string, KubeApi<KubeObject>>();

    for (const api of this.apiSet) {
      if (typeof api.apiBase !== "string" || !api.apiBase) {
        throw new TypeError("KubeApi.apiBase must be a non-empty string");
      }

      if (res.has(api.apiBase)) {
        throw new Error(`Multiple api instances for ${api.apiBase}`);
      }

      res.set(api.apiBase, api);
    }

    return res;
  }

  /**
   * @param api The instance to check if it has been registered
   * @returns Returns `true` if the api instance has been registered
   */
  hasApi(api: KubeApi<KubeObject>): boolean {
    return this.apiSet.has(api);
  }

  /**
   * Get a registered api, if a callback is provided then the registered
   * instances are iterated until it returns `true`
   * @param pathOrCallbacks Either the `apiBase` of an instance, a resource path for the kind of the api, or a callback function. Will search for each until one is found.
   * @returns The kube api instance that was registered
   */
  getApi(...pathOrCallbacks: (string | ((api: KubeApi<KubeObject>) => boolean))[]): KubeApi<KubeObject> | undefined {
    for (const pathOrCallback of pathOrCallbacks) {
      if (typeof pathOrCallback === "string") {
        return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
      }

      return iter.find(this.apis.values(), pathOrCallback);
    }

    return undefined;
  }

  /**
   * Get the registered api instance by the kube object kind and version
   * @param kind The kind of resource that the api is for
   * @param apiVersion The version of the resource that the api is for
   * @returns The kube api instance that was registered
   */
  getApiByKind(kind: string, apiVersion: string) {
    return iter.find(this.apis.values(), api => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  /**
   * Registeres `api` so that it can be retreived in the future.
   *
   * Notes:
   * - Changes to the instance's `apiBase` field are reacted to for the `getApi()` method
   * @param api The instance to register
   * @throws if `api.apiBase` is not a non-empty string
   * @throws if there is already an instance with the same `apiBase` registered
   */
  registerApi(api: KubeApi<KubeObject>): void;
  /**
   * @deprecated Just provide the `api` instance
   */
  registerApi(apiOrBase: string, api: KubeApi<KubeObject>): void
  @action
  registerApi(apiOrBase: string | KubeApi<KubeObject>, api?: KubeApi<KubeObject>): void {
    api = typeof apiOrBase === "string"
      ? api
      : apiOrBase;

    if (!this.apiSet.has(api)) {
      if (typeof api.apiBase !== "string" || !api.apiBase) {
        throw new TypeError("api.apiBase but be defined");
      }

      if (this.apis.has(api.apiBase)) {
        throw new Error(`Cannot register second api for ${api.apiBase}`);
      }

      this.apiSet.add(api);
    }
  }

  protected resolveApi<K extends KubeObject>(api?: string | KubeApi<K>): KubeApi<K> | undefined {
    if (!api) {
      return undefined;
    }

    if (typeof api === "string") {
      return this.getApi(api) as KubeApi<K>;
    }

    return api;
  }

  /**
   * Removes `api` from the set of registered apis
   * @param api The instance to de-register
   * @returns `true` if the instance was previously registered
   */
  @action
  unregisterApi(api: KubeApi<KubeObject>) {
    return this.apiSet.delete(api);
  }

  /**
   * Registeres a `KubeObjectStore` instance that can be retrieved by the `apiBase` its api is for
   * @param store The store to register
   */
  registerStore(store: KubeObjectStore<KubeObject>): void;
  /**
   * @deprecated stores should only be registered for the single api that the store is for.
   */
  registerStore(store: KubeObjectStore<KubeObject>, apis: KubeApi<KubeObject>[]): void;
  @action
  registerStore(store: KubeObjectStore<KubeObject>, apis?: KubeApi<KubeObject>[]) {
    apis ??= [store.api];

    for (const api of apis) {
      if (!this.apiSet.has(api)) {
        throw new Error(`Cannot register store under ${api.apiBase} api, as that api is not registered`);
      }

      if (this.stores.has(api)) {
        throw new Error(`Each api instance can only have one store associated with it. Attempt to register a duplicate store for the ${api.apiBase} api`);
      }

      this.stores.set(api, store);
    }
  }

  /**
   *
   * @param apiOrBases The `apiBase`, resource descriptor, or `KubeApi` instance that the store is for. In order of searching
   * @returns The registered store whose api has also been registered
   */
  getStore(...apiOrBases: (string | KubeApi<KubeObject>)[]): KubeObjectStore<KubeObject> | undefined;
  /**
   * @deprecated Should use a cast instead as this is an unchecked type param.
   */
  getStore<S extends KubeObjectStore<KubeObject>>(...apiOrBases: (string | KubeApi<KubeObject>)[]): S | undefined {
    for (const apiOrBase of apiOrBases) {
      const store = this.stores.get(this.resolveApi(apiOrBase)) as S;

      if (store) {
        return store;
      }
    }

    return undefined;
  }

  /**
   * Get a URL pathname for a specific kube resource instance
   * @param ref The kube object reference
   * @param parentObject If provided then the namespace of this will be used if the `ref` does not provided it
   * @returns A kube resource string
   */
  lookupApiLink = (ref: IKubeObjectRef, parentObject?: KubeObject): string => {
    const {
      kind, apiVersion, name,
      namespace = parentObject?.getNs(),
    } = ref;

    if (!kind) return "";

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
  };
}
