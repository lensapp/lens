import type { KubeObjectStore } from "../kube-object.store";

import { action, observable } from "mobx";
import { autobind } from "../utils";
import { KubeApi, parseKubeApi } from "./kube-api";
import { KubeObject } from "./kube-object";

@autobind()
export class ApiManager {
  private apis = observable.map<string, KubeApi<any, any>>();
  private stores = observable.map<string, KubeObjectStore<any, any, KubeObject<any, any>>>();

  getApi(pathOrCallback: string | ((api: KubeApi<any, any>) => boolean)) {
    if (typeof pathOrCallback === "string") {
      return this.apis.get(pathOrCallback) || this.apis.get(parseKubeApi(pathOrCallback).apiBase);
    }

    return Array.from(this.apis.values()).find(pathOrCallback ?? (() => true));
  }

  getApiByKind(kind: string, apiVersion: string) {
    for (const api of this.apis.values()) {
      if (api.kind === kind && api.apiVersionWithGroup === apiVersion) {
        return api;
      }
    }
  }

  registerApi<Spec, Status>(apiBase: string, api: KubeApi<Spec, Status>) {
    if (!this.apis.has(apiBase)) {
      this.stores.forEach((store) => {
        if(store.api === api) {
          this.stores.set(apiBase, store);
        }
      });

      this.apis.set(apiBase, api);
    }
  }

  protected resolveApi<Spec, Status>(api: string | KubeApi<Spec, Status>): KubeApi<Spec, Status> | undefined {
    if (typeof api === "string") return this.getApi(api);

    return api;
  }

  unregisterApi<Spec, Status>(api: string | KubeApi<Spec, Status>) {
    if (typeof api === "string") this.apis.delete(api);
    else {
      const apis = Array.from(this.apis.entries());
      const entry = apis.find(entry => entry[1] === api);

      if (entry) this.unregisterApi(entry[0]);
    }
  }

  @action
  registerStore<Spec, Status>(store: KubeObjectStore<Spec, Status, KubeObject<Spec, Status>>, apis: KubeApi<Spec, Status>[] = [store.api]) {
    apis.forEach(api => {
      this.stores.set(api.apiBase, store);
    });
  }

  getStore<Spec, Status, S extends KubeObjectStore<Spec, Status, KubeObject<Spec, Status>>>(api: string | KubeApi<Spec, Status>): S | undefined {
    const apiBase = this.resolveApi(api)?.apiBase;

    if (!apiBase) {
      return;
    }

    return this.stores.get(apiBase) as S;
  }
}

export const apiManager = new ApiManager();
