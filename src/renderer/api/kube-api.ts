// Base class for building all kubernetes apis
// Docs: https://kubernetes.io/docs/reference/using-api/api-concepts

import merge from "lodash/merge";
import { stringify } from "querystring";
import { apiKubePrefix, isDevelopment, isTestEnv } from "../../common/vars";
import logger from "../../main/logger";
import { apiManager } from "./api-manager";
import { apiKube } from "./index";
import { createKubeApiURL, parseKubeApi } from "./kube-api-parse";
import { KubeJsonApi, KubeJsonApiData, KubeJsonApiDataList, KubeJsonApiListMetadata, KubeJsonApiListMetadataParsed, KubeJsonApiResponse } from "./kube-json-api";
import { IKubeObjectConstructor, KubeObject } from "./kube-object";
import { kubeWatchApi } from "./kube-watch-api";

export interface IKubeApiOptions<T extends KubeObject> {
  /**
   * base api-path for listing all resources, e.g. "/api/v1/pods"
   */
  apiBase?: string;

  /**
   * If the API uses a different API endpoint (e.g. apiBase) depending on the cluster version,
   * fallback API bases can be listed individually.
   * The first (existing) API base is used in the requests, if apiBase is not found.
   * This option only has effect if checkPreferredVersion is true.
   */
  fallbackApiBases?: string[];

  objectConstructor?: IKubeObjectConstructor<T>;
  request?: KubeJsonApi;
  isNamespaced?: boolean;
  kind?: string;
  checkPreferredVersion?: boolean;
}

export interface IKubeApiQueryParams {
  watch?: boolean | number;
  resourceVersion?: string;
  resourceVersionMatch?: "Exact" | "NotOlderThan" // see also: https://kubernetes.io/docs/reference/using-api/api-concepts/#resourceversion-in-metadata
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
  labelSelector?: string | string[]; // restrict list of objects by their labels, e.g. labelSelector: ["label=value"]
  fieldSelector?: string | string[]; // restrict list of objects by their fields, e.g. fieldSelector: "field=name"
}

export interface IKubePreferredVersion {
  preferredVersion?: {
    version: string;
  }
}

export interface IKubeResourceList {
  resources: {
    kind: string;
    name: string;
    namespaced: boolean;
    singularName: string;
    storageVersionHash: string;
    verbs: string[];
  }[];
}

export interface IKubeApiCluster {
  id: string;
}

export function forCluster<T extends KubeObject>(cluster: IKubeApiCluster, kubeClass: IKubeObjectConstructor<T>): KubeApi<T> {
  const request = new KubeJsonApi({
    apiBase: apiKubePrefix,
    debug: isDevelopment,
  }, {
    headers: {
      "X-Cluster-ID": cluster.id
    }
  });

  return new KubeApi({
    objectConstructor: kubeClass,
    request
  });
}

export function ensureObjectSelfLink(api: KubeApi, object: KubeJsonApiData) {
  if (!object.metadata.selfLink) {
    object.metadata.selfLink = createKubeApiURL({
      apiPrefix: api.apiPrefix,
      apiVersion: api.apiVersionWithGroup,
      resource: api.apiResource,
      namespace: api.isNamespaced ? object.metadata.namespace : undefined,
      name: object.metadata.name,
    });
  }
}

export class KubeApi<T extends KubeObject = any> {
  readonly kind: string;
  readonly apiBase: string;
  readonly apiPrefix: string;
  readonly apiGroup: string;
  readonly apiVersion: string;
  readonly apiVersionPreferred?: string;
  readonly apiResource: string;
  readonly isNamespaced: boolean;

  public objectConstructor: IKubeObjectConstructor<T>;
  protected request: KubeJsonApi;
  protected resourceVersions = new Map<string, string>();

  constructor(protected options: IKubeApiOptions<T>) {
    const {
      objectConstructor = KubeObject as IKubeObjectConstructor,
      request = apiKube,
      kind = options.objectConstructor?.kind,
      isNamespaced = options.objectConstructor?.namespaced
    } = options || {};

    if (!options.apiBase) {
      options.apiBase = objectConstructor.apiBase;
    }
    const { apiBase, apiPrefix, apiGroup, apiVersion, resource } = parseKubeApi(options.apiBase);

    this.kind = kind;
    this.isNamespaced = isNamespaced;
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiResource = resource;
    this.request = request;
    this.objectConstructor = objectConstructor;

    this.checkPreferredVersion();
    this.parseResponse = this.parseResponse.bind(this);
    apiManager.registerApi(apiBase, this);
  }

  get apiVersionWithGroup() {
    return [this.apiGroup, this.apiVersionPreferred ?? this.apiVersion]
      .filter(Boolean)
      .join("/");
  }

  /**
   * Returns the latest API prefix/group that contains the required resource.
   * First tries options.apiBase, then urls in order from options.fallbackApiBases.
   */
  private async getLatestApiPrefixGroup() {
    // Note that this.options.apiBase is the "full" url, whereas this.apiBase is parsed
    const apiBases = [this.options.apiBase, ...this.options.fallbackApiBases];

    for (const apiUrl of apiBases) {
      // Split e.g. "/apis/extensions/v1beta1/ingresses" to parts
      const { apiPrefix, apiGroup, apiVersionWithGroup, resource } = parseKubeApi(apiUrl);

      // Request available resources
      try {
        const response = await this.request.get<IKubeResourceList>(`${apiPrefix}/${apiVersionWithGroup}`);

        // If the resource is found in the group, use this apiUrl
        if (response.resources?.find(kubeResource => kubeResource.name === resource)) {
          return { apiPrefix, apiGroup };
        }
      } catch (error) {
        // Exception is ignored as we can try the next url
        console.error(error);
      }
    }

    // Avoid throwing in tests
    if (isTestEnv) {
      return {
        apiPrefix: this.apiPrefix,
        apiGroup: this.apiGroup
      };
    }

    throw new Error(`Can't find working API for the Kubernetes resource ${this.apiResource}`);
  }

  /**
   * Get the apiPrefix and apiGroup to be used for fetching the preferred version.
   */
  private async getPreferredVersionPrefixGroup() {
    if (this.options.fallbackApiBases) {
      try {
        return await this.getLatestApiPrefixGroup();
      } catch (error) {
        // If valid API wasn't found, log the error and return defaults below
        logger.error(error);
      }
    }

    return {
      apiPrefix: this.apiPrefix,
      apiGroup: this.apiGroup
    };
  }

  protected async checkPreferredVersion() {
    if (this.options.fallbackApiBases && !this.options.checkPreferredVersion) {
      throw new Error("checkPreferredVersion must be enabled if fallbackApiBases is set in KubeApi");
    }

    if (this.options.checkPreferredVersion && this.apiVersionPreferred === undefined) {
      const { apiPrefix, apiGroup } = await this.getPreferredVersionPrefixGroup();

      // The apiPrefix and apiGroup might change due to fallbackApiBases, so we must override them
      Object.defineProperty(this, "apiPrefix", {
        value: apiPrefix
      });
      Object.defineProperty(this, "apiGroup", {
        value: apiGroup
      });

      const res = await this.request.get<IKubePreferredVersion>(`${this.apiPrefix}/${this.apiGroup}`);

      Object.defineProperty(this, "apiVersionPreferred", {
        value: res?.preferredVersion?.version ?? null,
      });

      if (this.apiVersionPreferred) {
        Object.defineProperty(this, "apiBase", { value: this.getUrl() });
        apiManager.registerApi(this.apiBase, this);
      }
    }
  }

  setResourceVersion(namespace = "", newVersion: string) {
    this.resourceVersions.set(namespace, newVersion);
  }

  getResourceVersion(namespace = "") {
    return this.resourceVersions.get(namespace);
  }

  async listMetadata({ namespace = "" } = {}): Promise<KubeJsonApiListMetadataParsed> {
    const response = await this.rawList({ namespace }, {
      limit: 1, // specifying a limit to get metadata.remainingItemCount in response
      resourceVersion: this.getResourceVersion(namespace) ?? "1",
      resourceVersionMatch: "NotOlderThan",
    });

    const { remainingItemCount, ...metadata } = this.parseMetadata(namespace, response.metadata);

    return {
      ...metadata,
      itemsCount: remainingItemCount + 1, // +1 from limit=1
    };
  }

  async getItemsCount(): Promise<number> {
    try {
      const { itemsCount } = await this.listMetadata(); // list request for all namespaces

      return itemsCount;
    } catch (error) {
      logger.error(`[KUBE-API]: getItemsTotal() has failed: ${error}`);
    }

    return 0;
  }

  async refreshResourceVersion(params?: { namespace: string }): Promise<string> {
    try {
      const { resourceVersion } = await this.listMetadata(params);

      return resourceVersion;
    } catch (error) {
      logger.error(`[KUBE-API]: refreshing resourceVersion has failed: ${error}`, { params });
    }

    return "";
  }

  getUrl({ name = "", namespace = "" } = {}, query?: Partial<IKubeApiQueryParams>) {
    const resourcePath = createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: this.isNamespaced ? namespace : undefined,
      name,
    });

    return resourcePath + (query ? `?${stringify(this.normalizeQuery(query))}` : "");
  }

  protected normalizeQuery(query: Partial<IKubeApiQueryParams> = {}) {
    if (query.labelSelector) {
      query.labelSelector = [query.labelSelector].flat().join(",");
    }

    if (query.fieldSelector) {
      query.fieldSelector = [query.fieldSelector].flat().join(",");
    }

    return query;
  }

  protected parseResponse(data: KubeJsonApiResponse, namespace?: string): any {
    const KubeObjectConstructor = this.objectConstructor;

    if (KubeObject.isJsonApiData(data)) {
      const object = new KubeObjectConstructor(data);

      ensureObjectSelfLink(this, object);

      return object;
    }

    // process items list response
    if (KubeObject.isJsonApiDataList(data)) {
      const { apiVersion, items, metadata } = data;

      // parse & process metadata
      this.parseMetadata(namespace, metadata);

      return items.map((item) => {
        const object = new KubeObjectConstructor({
          kind: this.kind,
          apiVersion,
          ...item,
        });

        ensureObjectSelfLink(this, object);

        return object;
      });
    }

    // custom apis might return array for list response, e.g. users, groups, etc.
    if (Array.isArray(data)) {
      return data.map(data => new KubeObjectConstructor(data));
    }

    return data;
  }

  protected parseMetadata(namespace: string, metadata: KubeJsonApiListMetadata): KubeJsonApiListMetadata & { namespace: string } {
    const {
      resourceVersion = "1", // optimization for "?limit=1&resourceVersionMatch=[non-empty]&resourceVersionMatch=NotOlderThan"
      remainingItemCount = 0, // this is undefined for requests without ?limit
      ...unprocessedMeta
    } = metadata;

    // save "resourceVersion" for requests optimization
    this.setResourceVersion(namespace, resourceVersion);

    return {
      namespace,
      resourceVersion,
      remainingItemCount,
      ...unprocessedMeta,
    };
  }

  async rawList({ namespace = "" } = {}, query?: IKubeApiQueryParams): Promise<KubeJsonApiDataList> {
    await this.checkPreferredVersion();

    return this.request.get(this.getUrl({ namespace }), { query });
  }

  async list({ namespace = "" } = {}, query?: IKubeApiQueryParams): Promise<T[]> {
    return this.rawList({ namespace }, query)
      .then(data => this.parseResponse(data, namespace));
  }

  async get({ name = "", namespace = "default" } = {}, query?: IKubeApiQueryParams): Promise<T> {
    await this.checkPreferredVersion();

    return this.request
      .get(this.getUrl({ namespace, name }), { query })
      .then(this.parseResponse);
  }

  async create({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T> {
    await this.checkPreferredVersion();
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
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace, name });

    return this.request
      .put(apiUrl, { data })
      .then(this.parseResponse);
  }

  async delete({ name = "", namespace = "default" }) {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace, name });

    return this.request.del(apiUrl);
  }

  getWatchUrl(namespace = "", query: IKubeApiQueryParams = {}) {
    return this.getUrl({ namespace }, {
      watch: 1,
      resourceVersion: this.getResourceVersion(namespace),
      ...query,
    });
  }

  watch(): () => void {
    return kubeWatchApi.subscribeApi(this);
  }
}

export * from "./kube-api-parse";
