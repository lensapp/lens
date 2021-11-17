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

// Base class for all kubernetes objects

import moment from "moment";
import type { KubeJsonApiData, KubeJsonApiDataList, KubeJsonApiListMetadata, KubeJsonApiMetadata } from "./kube-json-api";
import { autoBind, formatDuration } from "../utils";
import type { ItemObject } from "../item.store";
import { apiKube } from "./index";
import type { JsonApiParams } from "./json-api";
import * as resourceApplierApi from "./endpoints/resource-applier.api";
import { hasOptionalProperty, hasTypedProperty, isObject, isString, bindPredicate, isTypedArray, isRecord } from "../../common/utils/type-narrowing";
import type { Patch } from "rfc6902";

export type KubeObjectConstructor<K extends KubeObject> = (new (data: KubeJsonApiData | any) => K) & {
  kind?: string;
  namespaced?: boolean;
  apiBase?: string;
};

export interface KubeOwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller: boolean;
  blockOwnerDeletion: boolean;
}

export interface KubeObjectMetadata {
  uid: string;
  name: string;
  namespace?: string;
  creationTimestamp: string;
  resourceVersion: string;
  selfLink: string;
  deletionTimestamp?: string;
  finalizers?: string[];
  continue?: string; // provided when used "?limit=" query param to fetch objects list
  labels?: {
    [label: string]: string;
  };
  annotations?: {
    [annotation: string]: string;
  };
  ownerReferences?: KubeOwnerReference[];
}

export interface KubeStatusData {
  kind: string;
  apiVersion: string;
  code: number;
  message?: string;
  reason?: string;
}

export class KubeStatus {
  public readonly kind = "Status";
  public readonly apiVersion: string;
  public readonly code: number;
  public readonly message: string;
  public readonly reason: string;

  constructor(data: KubeStatusData) {
    this.apiVersion = data.apiVersion;
    this.code = data.code;
    this.message = data.message || "";
    this.reason = data.reason || "";
  }
}

export interface KubeObjectStatus {
  conditions?: {
    lastTransitionTime: string;
    message: string;
    reason: string;
    status: string;
    type?: string;
  }[];
}

export type KubeMetaField = keyof KubeObjectMetadata;

export class KubeCreationError extends Error {
  constructor(message: string, public data: any) {
    super(message);
  }
}

export type LabelMatchExpression = {
  /**
   * The label key that the selector applies to.
   */
  key: string;
} & (
  {
    /**
     * This represents the key's relationship to a set of values.
     */
    operator: "Exists" | "DoesNotExist";
    values?: undefined;
  }
  |
  {
    operator: "In" | "NotIn";
    /**
     * The set of values for to match according to the operator for the label.
     */
    values: string[];
  }
);

export interface LabelSelector {
  matchLabels?: Record<string, string | undefined>;
  matchExpressions?: LabelMatchExpression[];
}

export class KubeObject<Metadata extends KubeObjectMetadata = KubeObjectMetadata, Status = any, Spec = any> implements ItemObject {
  static readonly kind?: string;
  static readonly namespaced?: boolean;
  static readonly apiBase?: string;

  apiVersion: string;
  kind: string;
  metadata: Metadata;
  status?: Status;
  spec?: Spec;
  managedFields?: any;

  static create(data: KubeJsonApiData) {
    return new KubeObject(data);
  }

  static isNonSystem(item: KubeJsonApiData | KubeObject) {
    return !item.metadata.name.startsWith("system:");
  }

  static isJsonApiData(object: unknown): object is KubeJsonApiData {
    return (
      isObject(object)
      && hasTypedProperty(object, "kind", isString)
      && hasTypedProperty(object, "apiVersion", isString)
      && hasTypedProperty(object, "metadata", KubeObject.isKubeJsonApiMetadata)
    );
  }

  static isKubeJsonApiListMetadata(object: unknown): object is KubeJsonApiListMetadata {
    return (
      isObject(object)
      && hasOptionalProperty(object, "resourceVersion", isString)
      && hasOptionalProperty(object, "selfLink", isString)
    );
  }

  static isKubeJsonApiMetadata(object: unknown): object is KubeJsonApiMetadata {
    return (
      isObject(object)
      && hasTypedProperty(object, "uid", isString)
      && hasTypedProperty(object, "name", isString)
      && hasTypedProperty(object, "resourceVersion", isString)
      && hasOptionalProperty(object, "selfLink", isString)
      && hasOptionalProperty(object, "namespace", isString)
      && hasOptionalProperty(object, "creationTimestamp", isString)
      && hasOptionalProperty(object, "continue", isString)
      && hasOptionalProperty(object, "finalizers", bindPredicate(isTypedArray, isString))
      && hasOptionalProperty(object, "labels", bindPredicate(isRecord, isString, isString))
      && hasOptionalProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
    );
  }

  static isPartialJsonApiMetadata(object: unknown): object is Partial<KubeJsonApiMetadata> {
    return (
      isObject(object)
      && hasOptionalProperty(object, "uid", isString)
      && hasOptionalProperty(object, "name", isString)
      && hasOptionalProperty(object, "resourceVersion", isString)
      && hasOptionalProperty(object, "selfLink", isString)
      && hasOptionalProperty(object, "namespace", isString)
      && hasOptionalProperty(object, "creationTimestamp", isString)
      && hasOptionalProperty(object, "continue", isString)
      && hasOptionalProperty(object, "finalizers", bindPredicate(isTypedArray, isString))
      && hasOptionalProperty(object, "labels", bindPredicate(isRecord, isString, isString))
      && hasOptionalProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
    );
  }

  static isPartialJsonApiData(object: unknown): object is Partial<KubeJsonApiData> {
    return (
      isObject(object)
      && hasOptionalProperty(object, "kind", isString)
      && hasOptionalProperty(object, "apiVersion", isString)
      && hasOptionalProperty(object, "metadata", KubeObject.isPartialJsonApiMetadata)
    );
  }

  static isJsonApiDataList<T>(object: unknown, verifyItem: (val: unknown) => val is T): object is KubeJsonApiDataList<T> {
    return (
      isObject(object)
      && hasTypedProperty(object, "kind", isString)
      && hasTypedProperty(object, "apiVersion", isString)
      && hasTypedProperty(object, "metadata", KubeObject.isKubeJsonApiListMetadata)
      && hasTypedProperty(object, "items", bindPredicate(isTypedArray, verifyItem))
    );
  }

  static stringifyLabels(labels?: { [name: string]: string }): string[] {
    if (!labels) return [];

    return Object.entries(labels).map(([name, value]) => `${name}=${value}`);
  }

  /**
   * These must be RFC6902 compliant paths
   */
  private static readonly nonEditablePathPrefixes = [
    "/metadata/managedFields",
    "/status",
  ];
  private static readonly nonEditablePaths = new Set([
    "/apiVersion",
    "/kind",
    "/metadata/name",
    "/metadata/selfLink",
    "/metadata/resourceVersion",
    "/metadata/uid",
    ...KubeObject.nonEditablePathPrefixes,
  ]);

  constructor(data: KubeJsonApiData) {
    if (typeof data !== "object") {
      throw new TypeError(`Cannot create a KubeObject from ${typeof data}`);
    }

    if (!data.metadata || typeof data.metadata !== "object") {
      throw new KubeCreationError(`Cannot create a KubeObject from an object without metadata`, data);
    }

    Object.assign(this, data);
    autoBind(this);
  }

  get selfLink() {
    return this.metadata.selfLink;
  }

  getId() {
    return this.metadata.uid;
  }

  getResourceVersion() {
    return this.metadata.resourceVersion;
  }

  getName() {
    return this.metadata.name;
  }

  getNs() {
    // avoid "null" serialization via JSON.stringify when post data
    return this.metadata.namespace || undefined;
  }

  getTimeDiffFromNow(): number {
    return Date.now() - new Date(this.metadata.creationTimestamp).getTime();
  }

  getAge(humanize = true, compact = true, fromNow = false): string | number {
    if (fromNow) {
      return moment(this.metadata.creationTimestamp).fromNow(); // "string", getTimeDiffFromNow() cannot be used
    }
    const diff = this.getTimeDiffFromNow();

    if (humanize) {
      return formatDuration(diff, compact);
    }

    return diff;
  }

  getFinalizers(): string[] {
    return this.metadata.finalizers || [];
  }

  getLabels(): string[] {
    return KubeObject.stringifyLabels(this.metadata.labels);
  }

  getAnnotations(filter = false): string[] {
    const labels = KubeObject.stringifyLabels(this.metadata.annotations);

    return filter ? labels.filter(label => {
      const skip = resourceApplierApi.annotations.some(key => label.startsWith(key));

      return !skip;
    }) : labels;
  }

  getOwnerRefs() {
    const refs = this.metadata.ownerReferences || [];
    const namespace = this.getNs();

    return refs.map(ownerRef => ({ ...ownerRef, namespace }));
  }

  getSearchFields() {
    const { getName, getId, getNs, getAnnotations, getLabels } = this;

    return [
      getName(),
      getNs(),
      getId(),
      ...getLabels(),
      ...getAnnotations(true),
    ];
  }

  toPlainObject(): object {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * @deprecated use KubeApi.patch instead
   */
  async patch(patch: Patch): Promise<KubeJsonApiData | null> {
    for (const op of patch) {
      if (KubeObject.nonEditablePaths.has(op.path)) {
        throw new Error(`Failed to update ${this.kind}: JSON pointer ${op.path} has been modified`);
      }

      for (const pathPrefix of KubeObject.nonEditablePathPrefixes) {
        if (op.path.startsWith(`${pathPrefix}/`)) {
          throw new Error(`Failed to update ${this.kind}: Child JSON pointer of ${op.path} has been modified`);
        }
      }
    }

    return resourceApplierApi.patch(this.getName(), this.kind, this.getNs(), patch);
  }

  /**
   * Perform a full update (or more specifically a replace)
   *
   * Note: this is brittle if `data` is not actually partial (but instead whole).
   * As fields such as `resourceVersion` will probably out of date. This is a
   * common race condition.
   *
   * @deprecated use KubeApi.update instead
   */
  async update(data: Partial<this>): Promise<KubeJsonApiData | null> {
    // use unified resource-applier api for updating all k8s objects
    return resourceApplierApi.update({
      ...this.toPlainObject(),
      ...data,
    });
  }

  /**
   * @deprecated use KubeApi.delete instead
   */
  delete(params?: JsonApiParams) {
    return apiKube.del(this.selfLink, params);
  }
}
