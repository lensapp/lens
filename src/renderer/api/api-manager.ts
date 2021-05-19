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

import type { KubeObjectStore, KubeObjectStoreConstructor } from "../kube-object.store";

import { action, observable } from "mobx";
import { autobind, Singleton } from "../utils";
import type { KubeApi } from "./kube-api";
import { parseKubeApi } from "./kube-api-parse";
import type { IKubeApiLinkRef, IKubeObjectRef } from "./kube-api-parse";
import type { KubeObject } from "./kube-object";
import type { Cluster } from "../../main/cluster";

export function createKubeApiURL(ref: IKubeApiLinkRef): string {
  const { apiPrefix = "/apis", resource, apiVersion, name } = ref;
  let { namespace } = ref;

  if (namespace) {
    namespace = `namespaces/${namespace}`;
  }

  return [apiPrefix, apiVersion, namespace, resource, name]
    .filter(v => v)
    .join("/");
}

@autobind()
export class ApiManager extends Singleton {
  private apis = observable.map<string, KubeApi>();
  private stores = observable.map<string, KubeObjectStore<KubeObject>>();

  constructor(protected cluster: Cluster) {
    super();
  }

  getApi(pathOrCallback: string | ((api: KubeApi) => boolean)) {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
    }

    return Array.from(this.apis.values()).find(pathOrCallback ?? (() => true));
  }

  getApiByKind(kind: string, apiVersion: string) {
    return Array.from(this.apis.values()).find((api) => api.kind === kind && api.apiVersionWithGroup === apiVersion);
  }

  registerApi(apiBase: string, api: KubeApi) {
    if (!this.apis.has(apiBase)) {
      this.stores.forEach((store) => {
        if(store.api === api) {
          this.stores.set(apiBase, store);
        }
      });

      this.apis.set(apiBase, api);
    }
  }

  protected resolveApi(api: string | KubeApi): KubeApi {
    if (typeof api === "string") return this.getApi(api);

    return api;
  }

  unregisterApi(api: string | KubeApi) {
    if (typeof api === "string") this.apis.delete(api);
    else {
      const apis = Array.from(this.apis.entries());
      const entry = apis.find(entry => entry[1] === api);

      if (entry) this.unregisterApi(entry[0]);
    }
  }

  @action
  registerStore<Store extends KubeObjectStore<KubeObject>>(storeConstructor: KubeObjectStoreConstructor<Store>, apis?: KubeApi[]): this {
    const store = new storeConstructor(this.cluster);

    for (const api of apis ?? [store.api]) {
      this.stores.set(api.apiBase, store);
    }

    return this;
  }

  getStore<Store extends KubeObjectStore<KubeObject>>(api: string | KubeApi): Store | undefined {
    return this.stores.get(this.resolveApi(api)?.apiBase) as Store;
  }

  lookupApiLink(ref: IKubeObjectRef, parentObject: KubeObject): string {
    const {
      kind, apiVersion, name,
      namespace = parentObject.getNs()
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
