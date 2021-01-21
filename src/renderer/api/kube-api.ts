// Base class for building all kubernetes apis

import merge from "lodash/merge";
import { stringify } from "querystring";
import { apiKubePrefix, isDevelopment, isTestEnv } from "../../common/vars";
import logger from "../../main/logger";
import { apiManager } from "./api-manager";
import { apiKube } from "./index";
import { createKubeApiURL, parseKubeApi } from "./kube-api-parse";
import { IKubeObjectConstructor, KubeObject, KubeStatus } from "./kube-object";
import byline from "byline";
import { IKubeWatchEvent } from "./kube-watch-api";
import { ReadableWebToNodeStream } from "../utils/readableStream";
import { KubeJsonApi, KubeJsonApiData } from "./kube-json-api";

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

export interface KubeApiListOptions {
  namespace?: string;
  reqInit?: RequestInit;
}

export interface IKubeApiQueryParams {
  watch?: boolean | number;
  resourceVersion?: string;
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

export type KubeApiWatchCallback = (data: IKubeWatchEvent, error: any) => void;

export type KubeApiWatchOptions = {
  namespace: string;
  callback?: KubeApiWatchCallback;
  abortController?: AbortController
};

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
  protected watchDisposer: () => void;

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

  async refreshResourceVersion(params?: KubeApiListOptions) {
    return this.list(params, { limit: 1 });
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

  protected parseResponse(data: unknown, namespace?: string): T | T[] | null {
    if (!data) return;
    const KubeObjectConstructor = this.objectConstructor;

    // process items list response, check before single item since there is overlap
    if (KubeObject.isJsonApiDataList(data, KubeObject.isPartialJsonApiData)) {
      const { apiVersion, items, metadata } = data;

      this.setResourceVersion(namespace, metadata.resourceVersion);
      this.setResourceVersion("", metadata.resourceVersion);

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

    // process a single item
    if (KubeObject.isJsonApiData(data)) {
      const object = new KubeObjectConstructor(data);

      ensureObjectSelfLink(this, object);

      return object;
    }

    // custom apis might return array for list response, e.g. users, groups, etc.
    if (Array.isArray(data)) {
      return data.map(data => new KubeObjectConstructor(data));
    }

    return null;
  }

  async list({ namespace = "", reqInit }: KubeApiListOptions = {}, query?: IKubeApiQueryParams): Promise<T[] | null> {
    await this.checkPreferredVersion();

    const res = await this.request.get(this.getUrl({ namespace }), { query }, reqInit);
    const parsed = this.parseResponse(res, namespace);

    if (!parsed || !Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  }

  async get({ name = "", namespace = "default" } = {}, query?: IKubeApiQueryParams): Promise<T | null> {
    await this.checkPreferredVersion();

    const res = await this.request.get(this.getUrl({ namespace, name }), { query });

    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  }

  async create({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace });

    const res = await this.request.post(apiUrl, {
      data: merge({
        kind: this.kind,
        apiVersion: this.apiVersionWithGroup,
        metadata: {
          name,
          namespace
        }
      }, data)
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  }

  async update({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace, name });

    const res = await this.request.put(apiUrl, { data });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      return null;
    }

    return parsed;
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

  watch(opts: KubeApiWatchOptions = { namespace: "" }): () => void {
    let errorReceived = false;
    let timedRetry: NodeJS.Timeout;
    const { abortController: { abort, signal } = new AbortController(), namespace, callback } = opts;

    signal.addEventListener("abort", () => {
      clearTimeout(timedRetry);
    });

    const watchUrl = this.getWatchUrl(namespace);
    const responsePromise = this.request.getResponse(watchUrl, null, { signal });

    responsePromise
      .then(response => {
        if (!response.ok) {
          return callback?.(null, response);
        }

        const nodeStream = new ReadableWebToNodeStream(response.body);

        ["end", "close", "error"].forEach((eventName) => {
          nodeStream.on(eventName, () => {
            if (errorReceived) return; // kubernetes errors should be handled in a callback

            clearTimeout(timedRetry);
            timedRetry = setTimeout(() => { // we did not get any kubernetes errors so let's retry
              this.watch({...opts, namespace, callback});
            }, 1000);
          });
        });

        const stream = byline(nodeStream);

        stream.on("data", (line) => {
          try {
            const event: IKubeWatchEvent = JSON.parse(line);

            if (event.type === "ERROR" && event.object.kind === "Status") {
              errorReceived = true;
              callback(null, new KubeStatus(event.object as any));

              return;
            }

            this.modifyWatchEvent(event);

            callback?.(event, null);
          } catch (ignore) {
          // ignore parse errors
          }
        });
      })
      .catch(error => {
        if (error instanceof DOMException) return; // AbortController rejects, we can ignore it

        callback?.(null, error);
      });

    return abort;
  }

  protected modifyWatchEvent(event: IKubeWatchEvent) {

    switch (event.type) {
      case "ADDED":
      case "DELETED":

      case "MODIFIED": {
        ensureObjectSelfLink(this, event.object);

        const { namespace, resourceVersion } = event.object.metadata;

        this.setResourceVersion(namespace, resourceVersion);
        this.setResourceVersion("", resourceVersion);

        break;
      }
    }
  }
}

export * from "./kube-api-parse";
