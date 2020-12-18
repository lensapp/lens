import type { KubeObjectStore } from "../kube-object.store";

import { action, observable } from "mobx";
import { autobind } from "../utils";
import { KubeApi } from "./kube-api";

@autobind()
export class ApiManager {
  private apis = observable.map<string, KubeApi>();
  private stores = observable.map<KubeApi, KubeObjectStore>();

  getApi(pathOrCallback: string | ((api: KubeApi) => boolean)) {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(KubeApi.parseApi(pathOrCallback).apiBase);
    }

    return Array.from(this.apis.values()).find(pathOrCallback ?? (() => true));
  }

  getApiByKind(kind: string, apiVersion: string) {
    return Array.from(this.apis.values()).find((api) => api.kind === kind && api.apiVersion === apiVersion);
  }

  registerApi(apiBase: string, api: KubeApi) {
    if (!this.apis.has(apiBase)) {
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
  registerStore(store: KubeObjectStore, apis: KubeApi[] = [store.api]) {
    apis.forEach(api => {
      this.stores.set(api, store);
    });
  }

  getStore<S extends KubeObjectStore>(api: string | KubeApi): S {
    return this.stores.get(this.resolveApi(api)) as S;
  }
}

export const apiManager = new ApiManager();
