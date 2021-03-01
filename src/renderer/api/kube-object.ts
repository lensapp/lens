// Base class for all kubernetes objects

import moment from "moment";
import { KubeJsonApiData, KubeJsonApiDataList, KubeJsonApiListMetadata, KubeJsonApiMetadata } from "./kube-json-api";
import { autobind, formatDuration } from "../utils";
import { ItemObject } from "../item.store";
import { apiKube } from "./index";
import { JsonApiParams } from "./json-api";
import { resourceApplierApi } from "./endpoints/resource-applier.api";
import { hasOptionalProperty, hasTypedProperty, isObject, isString, bindPredicate, isTypedArray, isRecord } from "../../common/utils/type-narrowing";

export type IKubeObjectConstructor<T extends KubeObject = any> = (new (data: KubeJsonApiData | any) => T) & {
  kind?: string;
  namespaced?: boolean;
  apiBase?: string;
};

export interface IKubeObjectMetadata {
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
  ownerReferences?: {
    apiVersion: string;
    kind: string;
    name: string;
    uid: string;
    controller: boolean;
    blockOwnerDeletion: boolean;
  }[];
}

export interface IKubeStatus {
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

  constructor(data: IKubeStatus) {
    this.apiVersion = data.apiVersion;
    this.code = data.code;
    this.message = data.message || "";
    this.reason = data.reason || "";
  }
}

export type IKubeMetaField = keyof IKubeObjectMetadata;

@autobind()
export class KubeObject implements ItemObject {
  static readonly kind: string;
  static readonly namespaced: boolean;

  static create(data: any) {
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
      && hasTypedProperty(object, "resourceVersion", isString)
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

  static isPartialJsonApiData(object: unknown): object is Partial<KubeJsonApiData> {
    return (
      isObject(object)
      && hasOptionalProperty(object, "kind", isString)
      && hasOptionalProperty(object, "apiVersion", isString)
      && hasOptionalProperty(object, "metadata", KubeObject.isKubeJsonApiMetadata)
    );
  }

  static isJsonApiDataList<T>(object: unknown, verifyItem:(val: unknown) => val is T): object is KubeJsonApiDataList<T> {
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

  constructor(data: KubeJsonApiData) {
    Object.assign(this, data);
  }

  apiVersion: string;
  kind: string;
  metadata: IKubeObjectMetadata;
  status?: any; // todo: type-safety support

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

    return refs.map(ownerRef => ({
      ...ownerRef,
      namespace: this.getNs(),
    }));
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

  // use unified resource-applier api for updating all k8s objects
  async update<T extends KubeObject>(data: Partial<T>) {
    return resourceApplierApi.update<T>({
      ...this.toPlainObject(),
      ...data,
    });
  }

  delete(params?: JsonApiParams) {
    return apiKube.del(this.selfLink, params);
  }
}
