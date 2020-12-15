import type { KubeObjectStore } from "../kube-object.store";

import { action, observable } from "mobx";
import { autobind } from "../utils";
import { KubeApi } from "./kube-api";
import { KubeObject } from "./kube-object";

@autobind()
export class ApiManager {
  private apis = observable.map<string, KubeApi>();
  private stores = observable.map<KubeApi, KubeObjectStore<any>>();

  getApi<T extends KubeObject = KubeObject>(pathOrCallback: string | ((api: KubeApi) => boolean) = () => true): KubeApi<T> {
    if (typeof pathOrCallback === "string") {
      return (this.apis.get(pathOrCallback) || this.apis.get(KubeApi.parseApi(pathOrCallback).apiBase)) as KubeApi<T>;
    }

    return Array.from(this.apis.values()).find(pathOrCallback) as KubeApi<T>;
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

  unregisterApi(api: string | KubeApi): void {
    if (typeof api === "string") {
      return void this.apis.delete(api);
    }

    for (const [apiPath, kubeApi] of this.apis) {
      if (kubeApi === api) {
        return void this.apis.delete(apiPath);
      }
    }
  }

  @action
  registerStore<T extends KubeObject>(store: KubeObjectStore<T>, apis: KubeApi[] = [store.api]) {
    apis.forEach(api => {
      this.stores.set(api, store);
    });
  }

  getStore<T extends KubeObject>(api: string | KubeApi): KubeObjectStore<T> {
    return this.stores.get(this.resolveApi(api));
  }
}

export const apiManager = new ApiManager();
