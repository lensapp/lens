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

export class ApiManager<TKubeObject extends KubeObject = any> {
  private apis = observable.map<string, KubeApi<TKubeObject>>();
  private stores = observable.map<string, KubeObjectStore<TKubeObject>>();

  constructor() {
    makeObservable(this);
    autoBind(this);
  }

  getApi(pathOrCallback: string | ((api: KubeApi<TKubeObject>) => boolean)) {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
    }

    return iter.find(this.apis.values(), pathOrCallback ?? (() => true));
  }

  getApiByKind(kind: string, apiVersion: string) {
    return iter.find(this.apis.values(), api => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  registerApi(apiBase: string, api: KubeApi<TKubeObject>) {
    if (!api.apiBase) return;

    if (!this.apis.has(apiBase)) {
      this.stores.forEach((store) => {
        if (store.api === api) {
          this.stores.set(apiBase, store);
        }
      });

      this.apis.set(apiBase, api);
    }
  }

  protected resolveApi(api?: string | KubeApi<TKubeObject>): KubeApi<TKubeObject> | undefined {
    if (!api) {
      return undefined;
    }

    if (typeof api === "string") {
      return this.getApi(api) as KubeApi<TKubeObject>;
    }

    return api;
  }

  unregisterApi(api: string | KubeApi<any>) {
    if (typeof api === "string") this.apis.delete(api);
    else {
      const apis = Array.from(this.apis.entries());
      const entry = apis.find(entry => entry[1] === api);

      if (entry) this.unregisterApi(entry[0]);
    }
  }

  @action
  registerStore(store: KubeObjectStore<any>, apis: KubeApi<any>[] = [store.api]) {
    apis.filter(Boolean).forEach(api => {
      if (api.apiBase) this.stores.set(api.apiBase, store);
    });
  }

  getStore<S extends KubeObjectStore<TKubeObject>>(api: string | KubeApi<TKubeObject>): S | undefined {
    return this.stores.get(this.resolveApi(api)?.apiBase) as S;
  }

  lookupApiLink<T extends KubeObject = KubeObject>(ref: IKubeObjectRef, parentObject?: T): string {
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
  }
}

export const apiManager = new ApiManager();
