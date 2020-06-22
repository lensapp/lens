// Base class for building all kubernetes apis

import merge from "lodash/merge"
import { stringify } from "querystring";
import { IKubeObjectConstructor, KubeObject } from "./kube-object";
import { IKubeObjectRef, KubeJsonApi, KubeJsonApiData, KubeJsonApiDataList } from "./kube-json-api";
import { apiKube } from "./index";
import { kubeWatchApi } from "./kube-watch-api";
import { apiManager } from "./api-manager";
import { split } from "../utils/arrays";
import isEqual from "lodash/isEqual";

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

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name: string;
  namespace?: string;
}

export interface IKubeApiLinkBase extends IKubeApiLinkRef {
  apiBase: string;
  apiGroup: string;
  apiVersionWithGroup: string;
}

export class KubeApi<T extends KubeObject = any> {
  static parseApi(apiPath = ""): IKubeApiLinkBase {
    apiPath = new URL(apiPath, location.origin).pathname;

    const [, prefix, ...parts] = apiPath.split("/");
    const apiPrefix = `/${prefix}`;

    const [left, right, namespaced] = split(parts, "namespaces");
    let apiGroup, apiVersion, namespace, resource, name;

    if (namespaced) {
      switch (right.length) {
      case 0:
        resource = "namespaces"; // special case this due to `split` removing namespaces
        break;
      case 1:
        resource = right[0];
        break;
      default:
        [namespace, resource, name] = right;
        break;
      }

      apiVersion = left.pop();
      apiGroup = left.join("/");
    } else {
      switch (left.length) {
      case 2:
        resource = left.pop();
      case 1:
        apiVersion = left.pop();
        apiGroup = "";
        break;
      default:
        /**
             * Given that 
             *  - `apiVersion` is `GROUP/VERSION` and
             *  - `VERSION` is `DNS_LABEL` which is /^[a-z0-9]((-[a-z0-9])|[a-z0-9])*$/i
             *     where length <= 63
             *  - `GROUP` is /^D(\.D)*$/ where D is `DNS_LABEL` and length <= 253
             * 
             * There is no well defined selection from an array of items that were
             * seperated by '/'
             * 
             * Solution is to create a huristic. Namely:
             * 1. if '.' in left[0] then apiGroup <- left[0]
             * 2. if left[1] matches /^v[0-9]/ then apiGroup, apiVersion <- left[0], left[1]
             * 3. otherwise assume apiVersion <- left[0]
             * 4. always resource, name <- left[(0 or 1)+1..]
             */
        if (left[0].includes('.') || left[1].match(/^v[0-9]/)) {
          [apiGroup, apiVersion] = left;
          resource = left.slice(2).join("/")
        } else {
          apiGroup = "";
          apiVersion = left[0];
          [resource, name] = left.slice(1)
        }
        break;
      }
    }

    const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join("/");
    const apiBase = [apiPrefix, apiGroup, apiVersion, resource].filter(v => v).join("/");

    if (!apiBase) {
      throw new Error(`invalid apiPath: ${apiPath}`)
    }

    return {
      apiBase,
      apiPrefix, apiGroup,
      apiVersion, apiVersionWithGroup,
      namespace, resource, name,
    };
  }

  static createLink(ref: IKubeApiLinkRef): string {
    const { apiPrefix = "/apis", resource, apiVersion, name } = ref;
    let { namespace } = ref;
    if (namespace) {
      namespace = `namespaces/${namespace}`
    }
    return [apiPrefix, apiVersion, namespace, resource, name]
      .filter(v => v)
      .join("/")
  }

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
    const resourcePath = KubeApi.createLink({
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

export function lookupApiLink(ref: IKubeObjectRef, parentObject: KubeObject): string {
  const {
    kind, apiVersion, name,
    namespace = parentObject.getNs()
  } = ref;

  // search in registered apis by 'kind' & 'apiVersion'
  const api = apiManager.getApi(api => api.kind === kind && api.apiVersionWithGroup == apiVersion)
  if (api) {
    return api.getUrl({ namespace, name })
  }

  // lookup api by generated resource link
  const apiPrefixes = ["/apis", "/api"];
  const resource = kind.toLowerCase() + kind.endsWith("s") ? "es" : "s";
  for (const apiPrefix of apiPrefixes) {
    const apiLink = KubeApi.createLink({ apiPrefix, apiVersion, name, namespace, resource });
    if (apiManager.getApi(apiLink)) {
      return apiLink;
    }
  }

  // resolve by kind only (hpa's might use refs to older versions of resources for example)
  const apiByKind = apiManager.getApi(api => api.kind === kind);
  if (apiByKind) {
    return apiByKind.getUrl({ name, namespace })
  }

  // otherwise generate link with default prefix
  // resource still might exists in k8s, but api is not registered in the app
  return KubeApi.createLink({ apiVersion, name, namespace, resource })
}
