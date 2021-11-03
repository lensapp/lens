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

import merge from "lodash/merge";
import { isFunction } from "lodash";
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

  objectConstructor: KubeObjectConstructor<T>;
  request?: KubeJsonApi;
  isNamespaced?: boolean;
  kind?: string;
  checkPreferredVersion?: boolean;
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

/**
 * @deprecated
 */
export interface IKubeApiCluster extends ILocalKubeApiConfig {}

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

export function forCluster<T extends KubeObject>(cluster: ILocalKubeApiConfig, kubeClass: KubeObjectConstructor<T>): KubeApi<T> {
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

  return new KubeApi({
    objectConstructor: kubeClass,
    request,
  });
}

export function forRemoteCluster<T extends KubeObject>(config: IRemoteKubeApiConfig, kubeClass: KubeObjectConstructor<T>): KubeApi<T> {
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

  return new KubeApi({
    objectConstructor: kubeClass,
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
};

export class KubeApi<T extends KubeObject> {
  readonly kind: string;
  readonly apiBase: string;
  readonly apiPrefix: string;
  readonly apiGroup: string;
  readonly apiVersion: string;
  readonly apiVersionPreferred?: string;
  readonly apiResource: string;
  readonly isNamespaced: boolean;

  public objectConstructor: KubeObjectConstructor<T>;
  protected request: KubeJsonApi;
  protected resourceVersions = new Map<string, string>();
  protected watchDisposer: () => void;
  private watchId = 1;

  constructor(protected options: IKubeApiOptions<T>) {
    const {
      objectConstructor,
      request = apiKube,
      kind = options.objectConstructor?.kind,
      isNamespaced = options.objectConstructor?.namespaced,
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
        logger.error(error);
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
      Object.defineProperty(this, "apiPrefix", {
        value: apiPrefix,
      });
      Object.defineProperty(this, "apiGroup", {
        value: apiGroup,
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

  async get({ name = "", namespace = "default" } = {}, query?: IKubeApiQueryParams): Promise<T | null> {
    await this.checkPreferredVersion();

    const url = this.getUrl({ namespace, name });
    const res = await this.request.get(url, { query });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`GET single request to ${url} returned an array: ${JSON.stringify(parsed)}`);
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
          namespace,
        },
      }, data),
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`POST request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async update({ name = "", namespace = "default" } = {}, data?: Partial<T>): Promise<T | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.getUrl({ namespace, name });

    const res = await this.request.put(apiUrl, { data });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`PUT request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
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

  watch(opts: KubeApiWatchOptions = { namespace: "", retry: false }): () => void {
    let errorReceived = false;
    let timedRetry: NodeJS.Timeout;
    const { abortController: { abort, signal } = new AbortController(), namespace, callback = noop, retry } = opts;
    const { watchId = `${this.kind.toLowerCase()}-${this.watchId++}` } = opts;

    signal.addEventListener("abort", () => {
      logger.info(`[KUBE-API] watch (${watchId}) aborted ${watchUrl}`);
      clearTimeout(timedRetry);
    });

    const watchUrl = this.getWatchUrl(namespace);
    const responsePromise = this.request.getResponse(watchUrl, null, { signal, timeout: 600_000 });

    logger.info(`[KUBE-API] watch (${watchId}) ${retry === true ? "retried" : "started"} ${watchUrl}`);

    responsePromise
      .then(response => {
        if (!response.ok) {
          logger.warn(`[KUBE-API] watch (${watchId}) error response ${watchUrl}`, { status: response.status });

          return callback(null, response);
        }

        ["end", "close", "error"].forEach((eventName) => {
          response.body.on(eventName, () => {
            if (errorReceived) return; // kubernetes errors should be handled in a callback
            if (signal.aborted) return;

            logger.info(`[KUBE-API] watch (${watchId}) ${eventName} ${watchUrl}`);

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

    return abort;
  }

  protected modifyWatchEvent(event: IKubeWatchEvent<KubeJsonApiData>) {

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
