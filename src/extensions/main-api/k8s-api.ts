/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export * from "../common-k8s-api";

/**
 * @deprecated This function never works
 * @returns false
 */
export function isAllowedResource(...args: any[]) {
  return Boolean(void args);
}
