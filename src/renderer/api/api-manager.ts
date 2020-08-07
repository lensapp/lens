import type { KubeObjectStore } from "../kube-object.store";
import type { KubeObjectDetailsProps, KubeObjectListLayoutProps, KubeObjectMenuProps } from "../components/kube-object";
import type React from "react";

import { observable } from "mobx";
import { autobind } from "../utils/autobind";
import { KubeApi } from "./kube-api";

export interface ApiComponents {
  List?: React.ComponentType<KubeObjectListLayoutProps>;
  Menu?: React.ComponentType<KubeObjectMenuProps>;
  Details?: React.ComponentType<KubeObjectDetailsProps>;
}

@autobind()
export class ApiManager {
  private apis = observable.map<string, KubeApi>();
  private stores = observable.map<KubeApi, KubeObjectStore>();
  private views = observable.map<KubeApi, ApiComponents>();

  getApi(pathOrCallback: string | ((api: KubeApi) => boolean)) {
    if (typeof pathOrCallback === "string") {
      const { apiBase } = KubeApi.parseApi(pathOrCallback);
      const api = this.apis.get(pathOrCallback) || this.apis.get(apiBase);
      if (!api) {
        throw `"${apiBase}" is an unsupported kubernetes API`;
      }

      return api;
    }

    return Array.from(this.apis.values()).find(pathOrCallback);
  }

  /**
   * registerApi registers the provided api under its `apiBase` URL.
   * @param api the KubeApi object to register
   * @returns true if the KubeApi is a new entry, false if already
   *          present (and not updated)
   */
  registerApi(api: KubeApi): boolean {
    if (this.apis.has(api.apiBase)) {
      return false
    }

    this.apis.set(api.apiBase, api);
    return true;
  }

  protected resolveApi(api: string | KubeApi): KubeApi {
    if (typeof api === "string") return this.getApi(api)
    return api;
  }

  /**
   * unregisterApi removes the 
   * @param api the apiBase or KubeApi object to remove from the map
   * @returns true if the item was removed, false if not present
   */
  unregisterApi(api: string | KubeApi): boolean {
    if (typeof api === "string") {
      return this.apis.delete(api)
    }

    return this.apis.delete(api.apiBase);
  }

  registerStore(api: KubeApi, store: KubeObjectStore) {
    this.stores.set(api, store);
  }

  getStore(api: string | KubeApi): KubeObjectStore {
    return this.stores.get(this.resolveApi(api));
  }

  private registerViewsForApi(api: KubeApi, views: ApiComponents) {
    const currentViews = this.views.get(api) || {};
    this.views.set(api, {
      ...currentViews,
      ...views,
    });
  }

  registerViews(api: KubeApi | KubeApi[], views: ApiComponents) {
    if (Array.isArray(api)) {
      api.forEach(api => this.registerViewsForApi(api, views));
    } else {
      this.registerViewsForApi(api, views);
    }
  }

  getViews(api: string | KubeApi): ApiComponents {
    return this.views.get(this.resolveApi(api)) || {}
  }
}

export const apiManager = new ApiManager();
