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

// Base class for building all kubernetes apis

import { isFunction, merge } from "lodash";
import { stringify } from "querystring";
import { apiKubePrefix, isDevelopment } from "../../common/vars";
import logger from "../../main/logger";
import { apiManager } from "./api-manager";
import { apiBase, apiKube } from "./index";
import { createKubeApiURL, parseKubeApi } from "./kube-api-parse";
import { KubeObjectConstructor, KubeObject, KubeStatus } from "./kube-object";
import byline from "byline";
import type { IKubeWatchEvent } from "./kube-watch-api";
import { KubeJsonApi, KubeJsonApiData } from "./kube-json-api";
import { noop } from "../utils";
import type { RequestInit } from "node-fetch";
import AbortController from "abort-controller";
import { Agent, AgentOptions } from "https";
import type { Patch } from "rfc6902";

/**
 * The options used for creating a `KubeApi`
 */
export interface IKubeApiOptions<T extends KubeObject> {
  /**
   * base api-path for listing all resources, e.g. "/api/v1/pods"
   *
   * If not specified then will be the one on the `objectConstructor`
   */
  apiBase?: string;

  /**
   * If the API uses a different API endpoint (e.g. apiBase) depending on the cluster version,
   * fallback API bases can be listed individually.
   * The first (existing) API base is used in the requests, if apiBase is not found.
   * This option only has effect if checkPreferredVersion is true.
   */
  fallbackApiBases?: string[];

  /**
   * If `true` then will check all declared apiBases against the kube api server
   * for the first accepted one.
   */
  checkPreferredVersion?: boolean;

  /**
   * The constructor for the kube objects returned from the API
   */
  objectConstructor: KubeObjectConstructor<T>;

  /**
   * The api instance to use for making requests
   *
   * @default apiKube
   */
  request?: KubeJsonApi;

  /**
   * @deprecated should be specified by `objectConstructor`
   */
  isNamespaced?: boolean;

  /**
   * @deprecated should be specified by `objectConstructor`
   */
  kind?: string;
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

export interface KubeApiListOptions {
  namespace?: string;
  reqInit?: RequestInit;
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

export interface ILocalKubeApiConfig {
  metadata: {
    uid: string;
  }
}

export type PropagationPolicy = undefined | "Orphan" | "Foreground" | "Background";

/**
 * @deprecated
 */
export interface IKubeApiCluster extends ILocalKubeApiConfig { }

export type PartialKubeObject<T extends KubeObject> = Partial<Omit<T, "metadata">> & {
  metadata?: Partial<T["metadata"]>,
};

export interface IRemoteKubeApiConfig {
  cluster: {
    server: string;
    caData?: string;
    skipTLSVerify?: boolean;
  }
  user: {
    token?: string | (() => Promise<string>);
    clientCertificateData?: string;
    clientKeyData?: string;
  }
}

export function forCluster<T extends KubeObject, Y extends KubeApi<T> = KubeApi<T>>(cluster: ILocalKubeApiConfig, kubeClass: KubeObjectConstructor<T>, apiClass: new (apiOpts: IKubeApiOptions<T>) => Y = null): KubeApi<T> {
  const url = new URL(apiBase.config.serverAddress);
  const request = new KubeJsonApi({
    serverAddress: apiBase.config.serverAddress,
    apiBase: apiKubePrefix,
    debug: isDevelopment,
  }, {
    headers: {
      "Host": `${cluster.metadata.uid}.localhost:${url.port}`,
    },
  });

  if (!apiClass) {
    apiClass = KubeApi as new (apiOpts: IKubeApiOptions<T>) => Y;
  }

  return new apiClass({
    objectConstructor: kubeClass,
    request,
  });
}

export function forRemoteCluster<T extends KubeObject, Y extends KubeApi<T> = KubeApi<T>>(config: IRemoteKubeApiConfig, kubeClass: KubeObjectConstructor<T>, apiClass: new (apiOpts: IKubeApiOptions<T>) => Y = null): Y {
  const reqInit: RequestInit = {};
  const agentOptions: AgentOptions = {};

  if (config.cluster.skipTLSVerify === true) {
    agentOptions.rejectUnauthorized = false;
  }

  if (config.user.clientCertificateData) {
    agentOptions.cert = config.user.clientCertificateData;
  }

  if (config.user.clientKeyData) {
    agentOptions.key = config.user.clientKeyData;
  }

  if (config.cluster.caData) {
    agentOptions.ca = config.cluster.caData;
  }

  if (Object.keys(agentOptions).length > 0) {
    reqInit.agent = new Agent(agentOptions);
  }

  const token = config.user.token;
  const request = new KubeJsonApi({
    serverAddress: config.cluster.server,
    apiBase: "",
    debug: isDevelopment,
    ...(token ? {
      getRequestOptions: async () => ({
        headers: {
          "Authorization": `Bearer ${isFunction(token) ? await token() : token}`,
        },
      }),
    } : {}),
  }, reqInit);

  if (!apiClass) {
    apiClass = KubeApi as new (apiOpts: IKubeApiOptions<T>) => Y;
  }

  return new apiClass({
    objectConstructor: kubeClass as KubeObjectConstructor<T>,
    request,
  });
}

export function ensureObjectSelfLink(api: KubeApi<KubeObject>, object: KubeJsonApiData) {
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

export type KubeApiWatchCallback = (data: IKubeWatchEvent<KubeJsonApiData>, error: any) => void;

export type KubeApiWatchOptions = {
  namespace: string;
  callback?: KubeApiWatchCallback;
  abortController?: AbortController
  watchId?: string;
  retry?: boolean;

  // timeout in seconds
  timeout?: number;
};

export type KubeApiPatchType = "merge" | "json" | "strategic";

const patchTypeHeaders: Record<KubeApiPatchType, string> = {
  "merge": "application/merge-patch+json",
  "json": "application/json-patch+json",
  "strategic": "application/strategic-merge-patch+json",
};

export interface ResourceDescriptor {
  /**
   * The name of the kubernetes resource
   */
  name: string;

  /**
   * The namespace that the resource lives in (if the resource is namespaced)
   *
   * Note: if not provided and the resource kind is namespaced, then this defaults to `"default"`
   */
  namespace?: string;
}

export interface DeleteResourceDescriptor extends ResourceDescriptor {
  /**
   * This determinines how child resources should be handled by kubernetes
   *
   * @default "Background"
   */
  propagationPolicy?: PropagationPolicy;
}

export class KubeApi<T extends KubeObject> {
  readonly kind: string;
  readonly apiVersion: string;
  apiBase: string;
  apiPrefix: string;
  apiGroup: string;
  apiVersionPreferred?: string;
  readonly apiResource: string;
  readonly isNamespaced: boolean;

  public objectConstructor: KubeObjectConstructor<T>;
  protected request: KubeJsonApi;
  protected resourceVersions = new Map<string, string>();
  protected watchDisposer: () => void;
  private watchId = 1;

  constructor(protected options: IKubeApiOptions<T>) {
    const { objectConstructor, request, kind, isNamespaced } = options;
    const { apiBase, apiPrefix, apiGroup, apiVersion, resource } = parseKubeApi(options.apiBase || objectConstructor.apiBase);

    this.options = options;
    this.kind = kind ?? objectConstructor.kind;
    this.isNamespaced = isNamespaced ?? objectConstructor.namespaced ?? false;
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiResource = resource;
    this.request = request ?? apiKube;
    this.objectConstructor = objectConstructor;

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
    const apiBases = [this.options.apiBase, this.objectConstructor.apiBase, ...this.options.fallbackApiBases];

    for (const apiUrl of apiBases) {
      if (!apiUrl) {
        continue;
      }

      try {
        // Split e.g. "/apis/extensions/v1beta1/ingresses" to parts
        const { apiPrefix, apiGroup, apiVersionWithGroup, resource } = parseKubeApi(apiUrl);

        // Request available resources
        const response = await this.request.get<IKubeResourceList>(`${apiPrefix}/${apiVersionWithGroup}`);

        // If the resource is found in the group, use this apiUrl
        if (response.resources?.find(kubeResource => kubeResource.name === resource)) {
          return { apiPrefix, apiGroup };
        }
      } catch (error) {
        // Exception is ignored as we can try the next url
      }
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
        logger.error(`[KUBE-API]: ${error}`);
      }
    }

    return {
      apiPrefix: this.apiPrefix,
      apiGroup: this.apiGroup,
    };
  }

  protected async checkPreferredVersion() {
    if (this.options.fallbackApiBases && !this.options.checkPreferredVersion) {
      throw new Error("checkPreferredVersion must be enabled if fallbackApiBases is set in KubeApi");
    }

    if (this.options.checkPreferredVersion && this.apiVersionPreferred === undefined) {
      const { apiPrefix, apiGroup } = await this.getPreferredVersionPrefixGroup();

      // The apiPrefix and apiGroup might change due to fallbackApiBases, so we must override them
      this.apiPrefix = apiPrefix;
      this.apiGroup = apiGroup;

      const url = [apiPrefix, apiGroup].filter(Boolean).join("/");
      const res = await this.request.get<IKubePreferredVersion>(url);

      this.apiVersionPreferred = res?.preferredVersion?.version ?? null;

      if (this.apiVersionPreferred) {
        this.apiBase = this.computeApiBase();
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

  private computeApiBase(): string {
    return createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
    });
  }

  getUrl({ name, namespace }: Partial<ResourceDescriptor> = {}, query?: Partial<IKubeApiQueryParams>) {
    const resourcePath = createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: this.isNamespaced ? namespace ?? "default" : undefined,
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
    if (!data) return null;
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

    const url = this.getUrl({ namespace });
    const res = await this.request.get(url, { query }, reqInit);
    const parsed = this.parseResponse(res, namespace);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (!parsed) {
      return null;
    }

    throw new Error(`GET multiple request to ${url} returned not an array: ${JSON.stringify(parsed)}`);
  }

  async get(desc: ResourceDescriptor, query?: IKubeApiQueryParams): Promise<T | null> {
    await this.checkPreferredVersion();

    const url = this.getUrl(desc);
    const res = await this.request.get(url, { query });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`GET single request to ${url} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async create({ name, namespace }: Partial<ResourceDescriptor>, data?: PartialKubeObject<T>): Promise<T | null> {
    await this.checkPreferredVersion();

    const apiUrl = this.getUrl({ namespace });
    const res = await this.request.post(apiUrl, {
      data: merge(data, {
        kind: this.kind,
        apiVersion: this.apiVersionWithGroup,
        metadata: {
          name,
          namespace,
        },
      }),
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`POST request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async update({ name, namespace }: ResourceDescriptor, data: PartialKubeObject<T>): Promise<T | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace, name });

    const res = await this.request.put(apiUrl, {
      data: merge(data, {
        metadata: {
          name,
          namespace,
        },
      }),
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`PUT request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async patch(desc: ResourceDescriptor, data?: PartialKubeObject<T> | Patch, strategy: KubeApiPatchType = "strategic") {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl(desc);

    const res = await this.request.patch(apiUrl, { data }, {
      headers: {
        "content-type": patchTypeHeaders[strategy],
      },
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`PATCH request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed as T | null;
  }

  async delete({ propagationPolicy = "Background", ...desc }: DeleteResourceDescriptor) {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl(desc);

    return this.request.del(apiUrl, {
      query: {
        propagationPolicy,
      },
    });
  }

  getWatchUrl(namespace = "", query: IKubeApiQueryParams = {}) {
    return this.getUrl({ namespace }, {
      watch: 1,
      resourceVersion: this.getResourceVersion(namespace),
      ...query,
    });
  }

  watch(opts: KubeApiWatchOptions = { namespace: "", retry: false }): () => void {
    let errorReceived = false;
    let timedRetry: NodeJS.Timeout;
    const { namespace, callback = noop, retry, timeout } = opts;
    const { watchId = `${this.kind.toLowerCase()}-${this.watchId++}` } = opts;

    // Create AbortController for this request
    const abortController = new AbortController();

    // If caller aborts, abort using request's abortController
    if (opts.abortController) {
      opts.abortController.signal.addEventListener("abort", () => {
        abortController.abort();
      });
    }

    abortController.signal.addEventListener("abort", () => {
      logger.info(`[KUBE-API] watch (${watchId}) aborted ${watchUrl}`);
      clearTimeout(timedRetry);
    });

    const requestParams = timeout ? { query: { timeoutSeconds: timeout }} : {};
    const watchUrl = this.getWatchUrl(namespace);
    const responsePromise = this.request.getResponse(watchUrl, requestParams, {
      signal: abortController.signal,
      timeout: 600_000,
    });

    logger.info(`[KUBE-API] watch (${watchId}) ${retry === true ? "retried" : "started"} ${watchUrl}`);

    responsePromise
      .then(response => {
        // True if the current watch request was retried
        let requestRetried = false;

        if (!response.ok) {
          logger.warn(`[KUBE-API] watch (${watchId}) error response ${watchUrl}`, { status: response.status });

          return callback(null, response);
        }

        // Add mechanism to retry in case timeoutSeconds is set but the watch wasn't timed out.
        // This can happen if e.g. network is offline and AWS NLB is used.
        if (timeout) {
          setTimeout(() => {
            // We only retry if we haven't retried, haven't aborted and haven't received k8s error
            if (requestRetried || abortController.signal.aborted || errorReceived) {
              return;
            }

            // Close current request
            abortController.abort();

            logger.info(`[KUBE-API] Watch timeout set, but not retried, retrying now`);

            requestRetried = true;

            // Clearing out any possible timeout, although we don't expect this to be set
            clearTimeout(timedRetry);
            this.watch({ ...opts, namespace, callback, watchId, retry: true });
            // We wait longer than the timeout, as we expect the request to be retried with timeoutSeconds
          }, timeout * 1000 * 1.1);
        }

        ["end", "close", "error"].forEach((eventName) => {
          response.body.on(eventName, () => {
            // We only retry if we haven't retried, haven't aborted and haven't received k8s error
            // kubernetes errors (=errorReceived set) should be handled in a callback
            if (requestRetried || abortController.signal.aborted || errorReceived) {
              return;
            }

            logger.info(`[KUBE-API] watch (${watchId}) ${eventName} ${watchUrl}`);

            requestRetried = true;

            clearTimeout(timedRetry);
            timedRetry = setTimeout(() => { // we did not get any kubernetes errors so let's retry
              this.watch({ ...opts, namespace, callback, watchId, retry: true });
            }, 1000);
          });
        });

        byline(response.body).on("data", (line) => {
          try {
            const event: IKubeWatchEvent<KubeJsonApiData> = JSON.parse(line);

            if (event.type === "ERROR" && event.object.kind === "Status") {
              errorReceived = true;

              return callback(null, new KubeStatus(event.object as any));
            }

            this.modifyWatchEvent(event);
            callback(event, null);
          } catch (ignore) {
            // ignore parse errors
          }
        });
      })
      .catch(error => {
        logger.error(`[KUBE-API] watch (${watchId}) throwed ${watchUrl}`, error);

        callback(null, error);
      });

    return abortController.abort;
  }

  protected modifyWatchEvent(event: IKubeWatchEvent<KubeJsonApiData>) {
    if (event.type === "ERROR") {
      return;

    }

    ensureObjectSelfLink(this, event.object);

    const { namespace, resourceVersion } = event.object.metadata;

    this.setResourceVersion(namespace, resourceVersion);
    this.setResourceVersion("", resourceVersion);
  }
}
