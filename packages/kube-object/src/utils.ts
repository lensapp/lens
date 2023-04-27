/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  isObject,
  hasTypedProperty,
  isString,
  hasOptionalTypedProperty,
  bindPredicate,
  isTypedArray,
  isRecord,
} from "@k8slens/utilities";
import type {
  KubeJsonApiData,
  KubeObjectMetadata,
  KubeObjectScope,
  KubeJsonApiListMetadata,
  KubeJsonApiObjectMetadata,
  KubeJsonApiDataList,
} from "./api-types";
import type { KubeObject } from "./kube-object";

const resourceApplierAnnotationsForFiltering = ["kubectl.kubernetes.io/last-applied-configuration"];

export const filterOutResourceApplierAnnotations = (label: string) =>
  !resourceApplierAnnotationsForFiltering.some((key) => label.startsWith(key));

export function isKubeObjectNonSystem(
  item: KubeJsonApiData | KubeObject<KubeObjectMetadata<KubeObjectScope>, unknown, unknown>,
) {
  return !item.metadata.name?.startsWith("system:");
}

export function isJsonApiData(object: unknown): object is KubeJsonApiData {
  return (
    isObject(object) &&
    hasTypedProperty(object, "kind", isString) &&
    hasTypedProperty(object, "apiVersion", isString) &&
    hasTypedProperty(object, "metadata", isKubeJsonApiMetadata)
  );
}

export function isKubeJsonApiListMetadata(object: unknown): object is KubeJsonApiListMetadata {
  return (
    isObject(object) &&
    hasOptionalTypedProperty(object, "resourceVersion", isString) &&
    hasOptionalTypedProperty(object, "selfLink", isString)
  );
}

export function isKubeJsonApiMetadata(object: unknown): object is KubeJsonApiObjectMetadata {
  return (
    isObject(object) &&
    hasTypedProperty(object, "uid", isString) &&
    hasTypedProperty(object, "name", isString) &&
    hasTypedProperty(object, "resourceVersion", isString) &&
    hasOptionalTypedProperty(object, "selfLink", isString) &&
    hasOptionalTypedProperty(object, "namespace", isString) &&
    hasOptionalTypedProperty(object, "creationTimestamp", isString) &&
    hasOptionalTypedProperty(object, "continue", isString) &&
    hasOptionalTypedProperty(object, "finalizers", bindPredicate(isTypedArray, isString)) &&
    hasOptionalTypedProperty(object, "labels", bindPredicate(isRecord, isString, isString)) &&
    hasOptionalTypedProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
  );
}

export function isPartialJsonApiMetadata(object: unknown): object is Partial<KubeJsonApiObjectMetadata> {
  return (
    isObject(object) &&
    hasOptionalTypedProperty(object, "uid", isString) &&
    hasOptionalTypedProperty(object, "name", isString) &&
    hasOptionalTypedProperty(object, "resourceVersion", isString) &&
    hasOptionalTypedProperty(object, "selfLink", isString) &&
    hasOptionalTypedProperty(object, "namespace", isString) &&
    hasOptionalTypedProperty(object, "creationTimestamp", isString) &&
    hasOptionalTypedProperty(object, "continue", isString) &&
    hasOptionalTypedProperty(object, "finalizers", bindPredicate(isTypedArray, isString)) &&
    hasOptionalTypedProperty(object, "labels", bindPredicate(isRecord, isString, isString)) &&
    hasOptionalTypedProperty(object, "annotations", bindPredicate(isRecord, isString, isString))
  );
}

export function isPartialJsonApiData(object: unknown): object is Partial<KubeJsonApiData> {
  return (
    isObject(object) &&
    hasOptionalTypedProperty(object, "kind", isString) &&
    hasOptionalTypedProperty(object, "apiVersion", isString) &&
    hasOptionalTypedProperty(object, "metadata", isPartialJsonApiMetadata)
  );
}

export function isJsonApiDataList<T>(
  object: unknown,
  verifyItem: (val: unknown) => val is T,
): object is KubeJsonApiDataList<T> {
  return (
    isObject(object) &&
    hasTypedProperty(object, "kind", isString) &&
    hasTypedProperty(object, "apiVersion", isString) &&
    hasTypedProperty(object, "metadata", isKubeJsonApiListMetadata) &&
    hasTypedProperty(object, "items", bindPredicate(isTypedArray, verifyItem))
  );
}

export function stringifyLabels(labels?: Partial<Record<string, string>>): string[] {
  if (!labels) {
    return [];
  }

  return Object.entries(labels).map(([name, value]) => `${name}=${value}`);
}
