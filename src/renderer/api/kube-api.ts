// Base class for building all kubernetes apis

import merge from "lodash/merge"
import { stringify } from "querystring";
import { IKubeObjectConstructor, KubeObject } from "./kube-object";
import { KubeJsonApi, KubeJsonApiData, KubeJsonApiDataList } from "./kube-json-api";
import { apiKube } from "./index";
import { kubeWatchApi } from "./kube-watch-api";
import { apiManager } from "./api-manager";
import { createKubeApiURL, parseKubeApi } from "./kube-api-parse";

export interface IKubeApiOptions<T extends KubeObject> {
  kind: string; // resource type within api-group, e.g. "Namespace"
  apiBase: string; // base api-path for listing all resources, e.g. "/api/v1/pods"
  isNamespaced: boolean;
  objectConstructor?: IKubeObjectConstructor<T>;
  request?: KubeJsonApi;
}

export interface IKubeApiQueryParams {
  watch?: boolean | number;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
}

export class KubeApi<T extends KubeObject = any> {
  static parseApi = parseKubeApi;

  static watchAll(...apis: KubeApi[]) {
    const disposers = apis.map(api => api.watch());
    return () => disposers.forEach(unwatch => unwatch());
  }

  readonly kind: string
  readonly apiBase: string
  readonly apiPrefix: string
  readonly apiGroup: string
  readonly apiVersion: string
  readonly apiVersionWithGroup: string
  readonly apiResource: string
  readonly isNamespaced: boolean

  public objectConstructor: IKubeObjectConstructor<T>;
  protected request: KubeJsonApi;
  protected resourceVersions = new Map<string, string>();

  constructor(protected options: IKubeApiOptions<T>) {
    const {
      kind,
      isNamespaced = false,
      objectConstructor = KubeObject as IKubeObjectConstructor,
      request = apiKube
    } = options || {};
    const { apiBase, apiPrefix, apiGroup, apiVersion, apiVersionWithGroup, resource } = KubeApi.parseApi(options.apiBase);

    this.kind = kind;
    this.isNamespaced = isNamespaced;
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiVersionWithGroup = apiVersionWithGroup;
    this.apiResource = resource;
    this.request = request;
    this.objectConstructor = objectConstructor;

    this.parseResponse = this.parseResponse.bind(this);
    apiManager.registerApi(apiBase, this);
  }

  setResourceVersion(namespace = "", newVersion: string) {
    this.resourceVersions.set(namespace, newVersion);
  }

  getResourceVersion(namespace = "") {
    return this.resourceVersions.get(namespace);
  }

  async refreshResourceVersion(params?: { namespace: string }) {
    return this.list(params, { limit: 1 });
  }

  getUrl({ name = "", namespace = "" } = {}, query?: Partial<IKubeApiQueryParams>) {
    const { apiPrefix, apiVersionWithGroup, apiResource } = this;
    const resourcePath = createKubeApiURL({
      apiPrefix: apiPrefix,
      apiVersion: apiVersionWithGroup,
      resource: apiResource,
      namespace: this.isNamespaced ? namespace : undefined,
      name: name,
    });
    return resourcePath + (query ? `?` + stringify(query) : "");
  }

  protected parseResponse(data: KubeJsonApiData | KubeJsonApiData[] | KubeJsonApiDataList, namespace?: string): any {
    const KubeObjectConstructor = this.objectConstructor;
    if (KubeObject.isJsonApiData(data)) {
      return new KubeObjectConstructor(data);
    }

    // process items list response
    if (KubeObject.isJsonApiDataList(data)) {
      const { apiVersion, items, metadata } = data;
      this.setResourceVersion(namespace, metadata.resourceVersion);
      this.setResourceVersion("", metadata.resourceVersion);
      return items.map(item => new KubeObjectConstructor({
        kind: this.kind,
        apiVersion: apiVersion,
        ...item,
      }))
    }

    // custom apis might return array for list response, e.g. users, groups, etc.
    if (Array.isArray(data)) {
      return data.map(data => new KubeObjectConstructor(data));
    }

    return data;
  }

  async list({ namespace = "" } = {}, query?: IKubeApiQueryParams): Promise<T[]> {
    return this.request
      .get(this.getUrl({ namespace }), { query })
      .then(data => this.parseResponse(data, namespace));
  }

  async get({ name = "", namespace = "default" } = {}, query?: IKubeApiQueryParams): Promise<T> {
    return this.request
      .get(this.getUrl({ namespace, name }), { query })
      .then(this.parseResponse);
  }

  async create({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T> {
    const apiUrl = this.getUrl({ namespace });

    return this.request
      .post(apiUrl, {
        data: merge({
          kind: this.kind,
          apiVersion: this.apiVersionWithGroup,
          metadata: {
            name,
            namespace
          }
        }, data)
      })
      .then(this.parseResponse);
  }

  async update({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T> {
    const apiUrl = this.getUrl({ namespace, name });
    return this.request
      .put(apiUrl, { data })
      .then(this.parseResponse)
  }

  async delete({ name = "", namespace = "default" }) {
    const apiUrl = this.getUrl({ namespace, name });
    return this.request.del(apiUrl)
  }

  getWatchUrl(namespace = "", query: IKubeApiQueryParams = {}) {
    return this.getUrl({ namespace }, {
      watch: 1,
      resourceVersion: this.getResourceVersion(namespace),
      ...query,
    })
  }

  watch(): () => void {
    return kubeWatchApi.subscribe(this);
  }
}

export * from "./kube-api-parse"