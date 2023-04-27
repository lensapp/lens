/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { isObject, hasTypedProperty, hasOptionalTypedProperty, isString, isNumber } from "@k8slens/utilities";
import type { KubeStatusData } from "./api-types";

/**
 * Is the shape of {@link object} correct for {@link KubeStatusData}
 * @param object Some object
 * @returns
 */
export function isKubeStatusData(object: unknown): object is KubeStatusData {
  return (
    isObject(object) &&
    hasTypedProperty(object, "kind", isString) &&
    hasTypedProperty(object, "apiVersion", isString) &&
    hasTypedProperty(object, "code", isNumber) &&
    (hasOptionalTypedProperty(object, "message", isString) ||
      hasOptionalTypedProperty(object, "reason", isString) ||
      hasOptionalTypedProperty(object, "status", isString)) &&
    object.kind === "Status"
  );
}

export class KubeStatus {
  public readonly kind = "Status";

  public readonly apiVersion: string;

  public readonly code: number;

  public readonly message: string;

  public readonly reason: string;

  public readonly status: string;

  constructor(data: KubeStatusData) {
    this.apiVersion = data.apiVersion;
    this.code = data.code;
    this.message = data.message || "";
    this.reason = data.reason || "";
    this.status = data.status || "";
  }

  getExplanation(): string {
    const { code, message, reason, status } = this;

    return `${code}: ${message || reason || status}`;
  }
}
