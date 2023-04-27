/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStore } from "../kube-object.store";

import type { IComputedValue } from "mobx";
import { autorun,  action, observable } from "mobx";
import type { KubeApi } from "../kube-api";
import type { KubeObject, ObjectReference } from "@k8slens/kube-object";
import { parseKubeApi, createKubeApiURL } from "../kube-api-parse";
import { getOrInsertWith, iter } from "@k8slens/utilities";
import type { CreateCustomResourceStore } from "./create-custom-resource-store.injectable";

export type RegisterableStore<Store> = Store extends KubeObjectStore<any, any, any>
  ? Store
  : never;
export type RegisterableApi<Api> = Api extends KubeApi<any, any>
  ? Api
  : never;
export type KubeObjectStoreFrom<Api> = Api extends KubeApi<infer KubeObj, infer ApiData>
  ? KubeObjectStore<KubeObj, Api, ApiData>
  : never;

export type FindApiCallback = (api: KubeApi<KubeObject>) => boolean;

export interface ApiManagerDependencies {
  readonly apis: IComputedValue<KubeApi[]>;
  readonly crdApis: IComputedValue<KubeApi[]>;
  readonly stores: IComputedValue<KubeObjectStore[]>;
  createCustomResourceStore: CreateCustomResourceStore;
}

export class ApiManager {
  private readonly externalApis = observable.array<KubeApi>();
  private readonly externalStores = observable.array<KubeObjectStore>();
  private readonly defaultCrdStores = observable.map<string, KubeObjectStore>();
  private readonly apis = observable.map<string, KubeApi>();

  constructor(private readonly dependencies: ApiManagerDependencies) {
    // NOTE: this is done to preserve the old behaviour of an API being discoverable using all previous apiBases
    autorun(() => {
      const apis = iter.chain(this.dependencies.apis.get().values())
        .concat(this.externalApis.values());
      const removedApis = new Set(this.apis.values());
      const newState = new Map(this.apis);

      for (const api of apis) {
        removedApis.delete(api);
        newState.set(api.apiBase, api);
      }

      for (const api of removedApis) {
        for (const [apiBase, storedApi] of newState) {
          if (storedApi === api) {
            newState.delete(apiBase);
          }
        }
      }

      for (const crdApi of this.dependencies.crdApis.get()) {
        if (!newState.has(crdApi.apiBase)) {
          newState.set(crdApi.apiBase, crdApi);
        }
      }

      this.apis.replace(newState);
    });
  }

  getApi(pathOrCallback: string | FindApiCallback) {
    if (typeof pathOrCallback === "function") {
      return iter.find(this.apis.values(), pathOrCallback);
    }

    const parsedApi = parseKubeApi(pathOrCallback);

    if (!parsedApi) {
      return undefined;
    }

    return this.apis.get(parsedApi.apiBase);
  }

  getApiByKind(kind: string, apiVersion: string) {
    return this.getApi(api => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  registerApi<Api>(api: RegisterableApi<Api>): void;
  /**
   * @deprecated Just register the `api` by itself
   */
  registerApi<Api>(apiBase: string, api: RegisterableApi<Api>): void;
  registerApi<Api>(...args: [RegisterableApi<Api>] | [string, RegisterableApi<Api>]) {
    if (args.length === 1) {
      this.externalApis.push(args[0]);
    } else {
      this.externalApis.push(args[1]);
    }
  }

  unregisterApi(apiOrBase: string | KubeApi<KubeObject>) {
    if (typeof apiOrBase === "string") {
      const api = this.externalApis.find(api => api.apiBase === apiOrBase);

      if (api) {
        this.externalApis.remove(api);
      }
    } else {
      this.unregisterApi(apiOrBase.apiBase);
    }
  }

  registerStore<KubeObj>(store: RegisterableStore<KubeObj>): void;
  /**
   * @deprecated KubeObjectStore's should only every be about a single KubeApi type
   */
  registerStore<KubeObj>(store: RegisterableStore<KubeObj>, apis: KubeApi<KubeObject>[]): void;

  @action
  registerStore<KubeObj>(store: RegisterableStore<KubeObj>): void {
    this.externalStores.push(store);
  }

  private apiIsDefaultCrdApi(api: KubeApi): boolean {
    for (const crdApi of this.dependencies.crdApis.get()) {
      if (crdApi.apiBase === api.apiBase) {
        return true;
      }
    }

    return false;
  }

  getStore(api: string | undefined): KubeObjectStore | undefined;
  getStore<Api>(api: RegisterableApi<Api>): KubeObjectStoreFrom<Api> | undefined;
  /**
   * @deprecated use an actual cast instead of hiding it with this unused type param
   */
  getStore<Store extends KubeObjectStore>(api: string | KubeApi): Store | undefined ;
  getStore(apiOrBase: string | KubeApi | undefined): KubeObjectStore | undefined {
    if (!apiOrBase) {
      return undefined;
    }

    const { apiBase } = typeof apiOrBase === "string"
      ? parseKubeApi(apiOrBase) ?? {}
      : apiOrBase;

    const api = apiBase && this.getApi(apiBase);

    if (!api) {
      return undefined;
    }

    const defaultResult = iter.chain(this.dependencies.stores.get().values())
      .concat(this.externalStores.values())
      .find(store => store.api.apiBase === api.apiBase);

    if (defaultResult) {
      return defaultResult;
    }

    if (this.apiIsDefaultCrdApi(api)) {
      return getOrInsertWith(this.defaultCrdStores, api.apiBase, () => this.dependencies.createCustomResourceStore(api));
    }

    return undefined;
  }

  lookupApiLink(ref: ObjectReference, parentObject?: KubeObject): string {
    const {
      kind, apiVersion = "v1", name,
      namespace = parentObject?.getNs(),
    } = ref;

    if (!kind) return "";

    // search in registered apis by 'kind' & 'apiVersion'
    const api = this.getApi(api => api.kind === kind && api.apiVersionWithGroup == apiVersion);

    if (api) {
      return api.formatUrlForNotListing({ namespace, name });
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
      return apiByKind.formatUrlForNotListing({ name, namespace });
    }

    // otherwise generate link with default prefix
    // resource still might exists in k8s, but api is not registered in the app
    return createKubeApiURL({ apiVersion, name, namespace, resource });
  }
}
