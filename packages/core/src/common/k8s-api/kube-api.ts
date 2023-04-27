/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Base class for building all kubernetes apis

import { merge } from "lodash";
import { stringify } from "querystring";
import { createKubeApiURL, parseKubeApi } from "./kube-api-parse";
import type { KubeObjectConstructor, KubeJsonApiDataFor, KubeObjectMetadata, KubeJsonApiData, KubeObject, KubeObjectScope } from "@k8slens/kube-object";
import { isJsonApiData, isJsonApiDataList, isPartialJsonApiData, KubeStatus, isKubeStatusData } from "@k8slens/kube-object";
import byline from "byline";
import type { IKubeWatchEvent } from "./kube-watch-event";
import type { KubeJsonApi } from "./kube-json-api";
import type { Disposer } from "@k8slens/utilities";
import { isDefined, noop, WrappedAbortController } from "@k8slens/utilities";
import type { RequestInit, Response } from "@k8slens/node-fetch";
import type { Patch } from "rfc6902";
import assert from "assert";
import type { PartialDeep } from "type-fest";
import type { Logger } from "../logger";
import { matches } from "lodash/fp";
import { makeObservable, observable } from "mobx";

/**
 * The options used for creating a `KubeApi`
 */
export interface KubeApiOptions<T extends KubeObject, Data extends KubeJsonApiDataFor<T> = KubeJsonApiDataFor<T>> extends DerivedKubeApiOptions {
  /**
   * base api-path for listing all resources, e.g. "/api/v1/pods"
   *
   * Must be provided either here or under `objectConstructor.apiBase`
   * @deprecated should be specified by `objectConstructor`
   */
  apiBase?: string;

  /**
   * The constructor for the kube objects returned from the API
   */
  objectConstructor: KubeObjectConstructor<T, Data>;

  /**
   * Must be provided either here or under `objectConstructor.namespaced`
   * @deprecated should be specified by `objectConstructor`
   */
  isNamespaced?: boolean;

  /**
   * Must be provided either here or under `objectConstructor.kind`
   * @deprecated should be specified by `objectConstructor`
   */
  kind?: string;
}

export interface DerivedKubeApiOptions {
  /**
   * If the API uses a different API endpoint (e.g. apiBase) depending on the cluster version,
   * fallback API bases can be listed individually.
   *
   * The first (existing) API base is used in the requests, if apiBase is not found.
   *
   * This option only has effect if {@link DerivedKubeApiOptions.checkPreferredVersion} is `true`.
   */
  fallbackApiBases?: string[];

  /**
   * This option is useful for protecting against newer versions on the same apiBase from being
   * used. So that if a certain type only supports `v1`, or `v2` of some kind and then the `v3`
   * version becomes the `preferredVersion` on the server but still has `v2` then the `v2` version
   * will be used instead.
   *
   * This can help to prevent crashes in the future if the shape of a kind sufficently changes.
   *
   * The order is important. It should be sorted and the first entry should be the most preferable.
   *
   * This option only has effect if {@link DerivedKubeApiOptions.checkPreferredVersion} is `true`
   */
  allowedUsableVersions?: Partial<Record<string, [string, ...string[]]>>;

  /**
   * If `true` then will check all declared apiBases against the kube api server
   * for the first accepted one.
   *
   * @default false
   */
  checkPreferredVersion?: boolean;

  /**
   * The api instance to use for making requests
   *
   * @default apiKube
   */
  request?: KubeJsonApi;
}

export interface KubeApiQueryParams {
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
  };
}

export interface KubeApiResource {
  categories?: string[];
  group?: string;
  kind: string;
  name: string;
  namespaced: boolean;
  shortNames?: string[];
  singularName: string;
  storageVersionHash?: string;
  verbs: string[];
  version?: string;
}

export interface KubeApiResourceList {
  apiVersion?: string;
  groupVersion?: string;
  kind?: string;
  resources: KubeApiResource[];
}

export interface KubeApiResourceVersion {
  groupVersion: string;
  version: string;
}

export interface KubeApiResourceVersionList {
  apiVersion: string;
  kind: string;
  name: string;
  preferredVersion: KubeApiResourceVersion;
  versions: KubeApiResourceVersion[];
}

const not = <T>(fn: (val: T) => boolean) => (val: T) => !(fn(val));

const getOrderedVersions = (list: KubeApiResourceVersionList, allowedUsableVersions: string[] | undefined): KubeApiResourceVersion[] => [
  list.preferredVersion,
  ...list.versions.filter(not(matches(list.preferredVersion))),
].filter(({ version }) => !allowedUsableVersions || allowedUsableVersions.includes(version));

export type PropagationPolicy = undefined | "Orphan" | "Foreground" | "Background";

export type KubeApiWatchCallback<T extends KubeJsonApiData = KubeJsonApiData> = (data: IKubeWatchEvent<T> | null, error: KubeStatus | Response | null | Record<string, unknown>) => void;

export interface KubeApiWatchOptions<Object extends KubeObject, Data extends KubeJsonApiDataFor<Object>> {
  /**
   * If the resource is namespaced then the default is `"default"`
   */
  namespace?: string;

  /**
   * This will be called when either an error occurs or some data is received
   */
  callback?: KubeApiWatchCallback<Data>;

  /**
   * This is a way of aborting the request
   */
  abortController?: AbortController;

  /**
   * The ID used for tracking within logs
   */
  watchId?: string;

  /**
   * @default false
   */
  retry?: boolean;

  /**
   * timeout in seconds
   */
  timeout?: number;
}

export type KubeApiPatchType = "merge" | "json" | "strategic";

export const patchTypeHeaders: Record<KubeApiPatchType, string> = {
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

export type SpecificResourceDescriptor<Scope extends KubeObjectScope> = {
  /**
   * The name of the kubernetes resource
   */
  name: string;
} & (
  Scope extends KubeObjectScope.Cluster
    ? {}
    : Scope extends KubeObjectScope.Namespace
      ? {
        /**
         * The namespace that the resource lives in
         */
        namespace: string;
      }
      : {
        namespace?: string;
      }
);

export type NamespacedResourceDescriptor = SpecificResourceDescriptor<KubeObjectScope.Namespace>;
export type ClusterScopedResourceDescriptor = SpecificResourceDescriptor<KubeObjectScope.Cluster>;

export interface DeleteResourceDescriptor extends ResourceDescriptor {
  /**
   * This determinines how child resources should be handled by kubernetes
   *
   * @default "Background"
   */
  propagationPolicy?: PropagationPolicy;
}

export interface KubeApiDependencies {
  readonly logger: Logger;
  readonly maybeKubeApi: KubeJsonApi | undefined;
}

export class KubeApi<
  Object extends KubeObject = KubeObject,
  Data extends KubeJsonApiDataFor<Object> = KubeJsonApiDataFor<Object>,
> {
  readonly kind: string;
  readonly apiVersion: string;

  @observable apiBase: string;

  apiPrefix: string;
  apiGroup: string;
  apiVersionPreferred: string | undefined;
  readonly apiResource: string;
  readonly isNamespaced: boolean;

  public readonly objectConstructor: KubeObjectConstructor<Object, Data>;
  protected readonly request: KubeJsonApi;
  protected readonly resourceVersions = new Map<string, string>();
  protected readonly watchDisposer: Disposer | undefined;
  private watchId = 1;
  protected readonly doCheckPreferredVersion: boolean;
  protected readonly fullApiPathname: string;
  protected readonly fallbackApiBases: string[] | undefined;
  protected readonly allowedUsableVersions: Partial<Record<string, string[]>> | undefined;

  constructor(protected readonly dependencies: KubeApiDependencies, opts: KubeApiOptions<Object, Data>) {
    const {
      objectConstructor,
      request = this.dependencies.maybeKubeApi,
      kind = objectConstructor.kind,
      isNamespaced,
      apiBase: fullApiPathname = objectConstructor.apiBase,
      checkPreferredVersion: doCheckPreferredVersion = false,
      fallbackApiBases,
      allowedUsableVersions,
    } = opts;

    assert(fullApiPathname, "apiBase MUST be provided either via KubeApiOptions.apiBase or KubeApiOptions.objectConstructor.apiBase");
    assert(request, "request MUST be provided if not in a cluster page frame context");

    const parsedApi = parseKubeApi(fullApiPathname);

    assert(parsedApi, "apiBase MUST be a valid kube api pathname");

    const { apiBase, apiPrefix, apiGroup, apiVersion, resource } = parsedApi;

    assert(kind, "kind MUST be provided either via KubeApiOptions.kind or KubeApiOptions.objectConstructor.kind");
    assert(apiPrefix, "apiBase MUST be parsable as a kubeApi selfLink style string");

    this.doCheckPreferredVersion = doCheckPreferredVersion;
    this.fallbackApiBases = fallbackApiBases;
    this.allowedUsableVersions = allowedUsableVersions;
    this.fullApiPathname = fullApiPathname;
    this.kind = kind;
    this.isNamespaced = isNamespaced ?? objectConstructor.namespaced ?? false;
    this.apiBase = apiBase;
    this.apiPrefix = apiPrefix;
    this.apiGroup = apiGroup;
    this.apiVersion = apiVersion;
    this.apiResource = resource;
    this.request = request;
    this.objectConstructor = objectConstructor;
    makeObservable(this);
  }

  get apiVersionWithGroup() {
    return [this.apiGroup, this.apiVersionPreferred ?? this.apiVersion]
      .filter(Boolean)
      .join("/");
  }

  /**
   * Returns the latest API prefix/group that contains the required resource.
   * First tries fullApiPathname, then urls in order from fallbackApiBases.
   */
  private async getLatestApiPrefixGroup() {
    // Note that this.fullApiPathname is the "full" url, whereas this.apiBase is parsed
    const rawApiBases = [
      this.fullApiPathname,
      this.objectConstructor.apiBase,
      ...this.fallbackApiBases ?? [],
    ].filter(isDefined);
    const apiBases = new Set(rawApiBases);

    for (const apiUrl of apiBases) {
      const parsedApi = parseKubeApi(apiUrl);

      if (!parsedApi) {
        continue;
      }

      try {
        const { apiPrefix, apiGroup, resource } = parsedApi;
        const list = await this.request.get(`${apiPrefix}/${apiGroup}`) as KubeApiResourceVersionList;
        const resourceVersions = getOrderedVersions(list, this.allowedUsableVersions?.[apiGroup]);

        for (const resourceVersion of resourceVersions) {
          const { resources } = await this.request.get(`${apiPrefix}/${resourceVersion.groupVersion}`) as KubeApiResourceList;

          if (resources.some(({ name }) => name === resource)) {
            return {
              apiPrefix,
              apiGroup,
              apiVersionPreferred: resourceVersion.version,
            };
          }
        }
      } catch {
        // ignore exception to try next url
      }
    }

    throw new Error(`Can't find working API for the Kubernetes resource ${this.apiResource}`);
  }

  protected async checkPreferredVersion() {
    if (!this.doCheckPreferredVersion && (this.fallbackApiBases || this.allowedUsableVersions)) {
      throw new Error("checkPreferredVersion must be enabled if either fallbackApiBases or allowedUsableVersions are set in KubeApi");
    }

    if (this.doCheckPreferredVersion && this.apiVersionPreferred === undefined) {
      const { apiPrefix, apiGroup, apiVersionPreferred } = await this.getLatestApiPrefixGroup();

      this.apiPrefix = apiPrefix;
      this.apiGroup = apiGroup;
      this.apiVersionPreferred = apiVersionPreferred;
      this.apiBase = this.computeApiBase();
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

  /**
   * This method differs from {@link formatUrlForNotListing} because this treats `""` as "all namespaces"
   * NOTE: This is also useful for watching
   * @param namespace The namespace to list in or `""` for all namespaces
   */
  formatUrlForListing(namespace: string | undefined, query?: Partial<KubeApiQueryParams>) {
    const resourcePath = createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: this.isNamespaced
        ? namespace ?? "default"
        : undefined,
    });

    return resourcePath + (query ? `?${stringify(this.normalizeQuery(query))}` : "");
  }

  /**
   * Format a URL pathname and query for acting upon a specific resource.
   */
  formatUrlForNotListing({ name, namespace }: Partial<ResourceDescriptor> = {}) {
    return createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: this.isNamespaced
        ? namespace || "default"
        : undefined,
      name,
    });
  }

  /**
   * @deprecated use {@link formatUrlForNotListing} or {@link formatUrlForListing} instead
   */
  getUrl(resource?: Partial<ResourceDescriptor>, query?: Partial<KubeApiQueryParams>) {
    if (query) {
      return this.formatUrlForListing(resource?.namespace, query);
    }

    return this.formatUrlForNotListing(resource);
  }

  protected normalizeQuery(query: Partial<KubeApiQueryParams> = {}) {
    if (query.labelSelector) {
      query.labelSelector = [query.labelSelector].flat().join(",");
    }

    if (query.fieldSelector) {
      query.fieldSelector = [query.fieldSelector].flat().join(",");
    }

    return query;
  }

  protected parseResponse(data: unknown, namespace?: string): Object | Object[] | null {
    if (!data) {
      return null;
    }

    const KubeObjectConstructor = this.objectConstructor;

    // process items list response, check before single item since there is overlap
    if (isJsonApiDataList(data, isPartialJsonApiData)) {
      const { apiVersion, items, metadata } = data;

      this.setResourceVersion(namespace, metadata.resourceVersion);
      this.setResourceVersion("", metadata.resourceVersion);

      return items
        .map((item) => {
          if (item.metadata) {
            this.ensureMetadataSelfLink(item.metadata);
          } else {
            return undefined;
          }

          const object = new KubeObjectConstructor({
            ...(item as Data),
            kind: this.kind,
            apiVersion,
          });

          return object;
        })
        .filter(isDefined);
    }

    // process a single item
    if (isJsonApiData(data)) {
      this.ensureMetadataSelfLink(data.metadata);

      return new KubeObjectConstructor(data as Data);
    }

    if (!Array.isArray(data)) {
      return null;
    }

    // custom apis might return array for list response, e.g. users, groups, etc.
    return data
      .filter(isJsonApiData)
      .map((data) => (this.ensureMetadataSelfLink(data.metadata), data))
      .map((data) => new KubeObjectConstructor(data as Data));
  }

  private ensureMetadataSelfLink<T extends { selfLink?: string; namespace?: string; name: string }>(metadata: T): asserts metadata is T & { selfLink: string } {
    metadata.selfLink ||= createKubeApiURL({
      apiPrefix: this.apiPrefix,
      apiVersion: this.apiVersionWithGroup,
      resource: this.apiResource,
      namespace: metadata.namespace,
      name: metadata.name,
    });
  }

  async list({ namespace = "", reqInit }: KubeApiListOptions = {}, query?: KubeApiQueryParams): Promise<Object[] | null> {
    await this.checkPreferredVersion();

    const url = this.formatUrlForListing(namespace);
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

  async get(desc: ResourceDescriptor, query?: KubeApiQueryParams): Promise<Object | null> {
    await this.checkPreferredVersion();

    const url = this.formatUrlForNotListing(desc);
    const res = await this.request.get(url, { query });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`GET single request to ${url} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async create({ name, namespace }: Partial<ResourceDescriptor>, partialData?: PartialDeep<Object>): Promise<Object | null> {
    await this.checkPreferredVersion();

    const apiUrl = this.formatUrlForNotListing({ namespace });
    const data = merge(partialData, {
      kind: this.kind,
      apiVersion: this.apiVersionWithGroup,
      metadata: {
        name,
        namespace,
      },
    });
    const res = await this.request.post(apiUrl, { data });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`POST request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  async update({ name, namespace }: ResourceDescriptor, data: PartialDeep<Object>): Promise<Object | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.formatUrlForNotListing({ namespace, name });

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

  async patch(desc: ResourceDescriptor, data: PartialDeep<Object>): Promise<Object | null>;
  async patch(desc: ResourceDescriptor, data: PartialDeep<Object>, strategy: "strategic" | "merge"): Promise<Object | null>;
  async patch(desc: ResourceDescriptor, data: Patch, strategy: "json"): Promise<Object | null>;
  async patch(desc: ResourceDescriptor, data: PartialDeep<Object> | Patch, strategy: KubeApiPatchType): Promise<Object | null>;
  async patch(desc: ResourceDescriptor, data: PartialDeep<Object> | Patch, strategy: KubeApiPatchType = "strategic"): Promise<Object | null> {
    await this.checkPreferredVersion();
    const apiUrl = this.formatUrlForNotListing(desc);

    const res = await this.request.patch(apiUrl, { data }, {
      headers: {
        "content-type": patchTypeHeaders[strategy],
      },
    });
    const parsed = this.parseResponse(res);

    if (Array.isArray(parsed)) {
      throw new Error(`PATCH request to ${apiUrl} returned an array: ${JSON.stringify(parsed)}`);
    }

    return parsed;
  }

  /**
   * Some k8s resources might implement special "delete" (e.g. pod.api)
   * See also: https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/
   * By default should work same as delete()
   */
  async evict(desc: DeleteResourceDescriptor): Promise<KubeStatus | KubeObject | unknown> {
    return this.delete(desc);
  }

  async delete({ propagationPolicy = "Background", ...desc }: DeleteResourceDescriptor) {
    await this.checkPreferredVersion();
    const apiUrl = this.formatUrlForNotListing(desc);

    return this.request.del(apiUrl, {
      query: {
        propagationPolicy,
      },
    });
  }

  getWatchUrl(namespace?: string, query: KubeApiQueryParams = {}) {
    return this.formatUrlForListing(namespace, {
      watch: 1,
      resourceVersion: this.getResourceVersion(namespace),
      ...query,
    });
  }

  watch(opts?: KubeApiWatchOptions<Object, Data>): Disposer {
    let errorReceived = false;
    let timedRetry: NodeJS.Timeout;
    const {
      namespace,
      callback = noop as KubeApiWatchCallback<Data>,
      retry = false,
      timeout = 600,
      watchId = `${this.kind.toLowerCase()}-${this.watchId++}`,
    } = opts ?? {};

    // Create AbortController for this request
    const abortController = new WrappedAbortController(opts?.abortController);

    abortController.signal.addEventListener("abort", () => {
      this.dependencies.logger.info(`[KUBE-API] watch (${watchId}) aborted ${watchUrl}`);
      clearTimeout(timedRetry);
    });

    const requestParams = timeout ? { query: { timeoutSeconds: timeout }} : {};
    const watchUrl = this.getWatchUrl(namespace);
    const responsePromise = this.request.getResponse(watchUrl, requestParams, {
      signal: abortController.signal,
    });

    this.dependencies.logger.info(`[KUBE-API] watch (${watchId}) ${retry === true ? "retried" : "started"} ${watchUrl}`);

    responsePromise
      .then(response => {
        // True if the current watch request was retried
        let requestRetried = false;

        if (!response.ok) {
          this.dependencies.logger.warn(`[KUBE-API] watch (${watchId}) error response ${watchUrl}`, { status: response.status });

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

            this.dependencies.logger.info(`[KUBE-API] Watch timeout set, but not retried, retrying now`);

            requestRetried = true;

            // Clearing out any possible timeout, although we don't expect this to be set
            clearTimeout(timedRetry);
            this.watch({ ...opts, namespace, callback, watchId, retry: true });
            // We wait longer than the timeout, as we expect the request to be retried with timeoutSeconds
          }, timeout * 1000 * 1.1);
        }

        if (!response.body || !response.body.readable) {
          if (!response.body) {
            this.dependencies.logger.warn(`[KUBE-API]: watch (${watchId}) did not return a body`);
          }
          requestRetried = true;

          clearTimeout(timedRetry);
          timedRetry = setTimeout(() => { // we did not get any kubernetes errors so let's retry
            this.watch({ ...opts, namespace, callback, watchId, retry: true });
          }, 1000);

          return;
        }

        for (const eventName of ["end", "close", "error"]) {
          response.body.on(eventName, () => {
            // We only retry if we haven't retried, haven't aborted and haven't received k8s error
            // kubernetes errors (=errorReceived set) should be handled in a callback
            if (requestRetried || abortController.signal.aborted || errorReceived) {
              return;
            }

            this.dependencies.logger.info(`[KUBE-API] watch (${watchId}) ${eventName} ${watchUrl}`);

            requestRetried = true;

            clearTimeout(timedRetry);
            timedRetry = setTimeout(() => { // we did not get any kubernetes errors so let's retry
              this.watch({ ...opts, namespace, callback, watchId, retry: true });
            }, 1000);
          });
        }

        byline(response.body).on("data", (line: string) => {
          try {
            const event = JSON.parse(line) as IKubeWatchEvent<Data>;

            if (event.type === "ERROR" && isKubeStatusData(event.object)) {
              errorReceived = true;

              return callback(null, new KubeStatus(event.object));
            }

            this.modifyWatchEvent(event);
            callback(event, null);
          } catch (ignore) {
            // ignore parse errors
          }
        });
      })
      .catch((error: unknown) => {
        if (!abortController.signal.aborted) {
          this.dependencies.logger.error(`[KUBE-API] watch (${watchId}) threw ${watchUrl}`, error);
        }
        callback(null, error as Record<string, unknown>);
      });

    return () => {
      abortController.abort();
    };
  }

  protected modifyWatchEvent(event: IKubeWatchEvent<KubeJsonApiData<KubeObjectMetadata>>) {
    if (event.type === "ERROR") {
      return;
    }

    this.ensureMetadataSelfLink(event.object.metadata);

    const { namespace, resourceVersion } = event.object.metadata;

    assert(resourceVersion, "watch events failed to return resourceVersion from kube api");

    this.setResourceVersion(namespace, resourceVersion);
    this.setResourceVersion("", resourceVersion);
  }
}
