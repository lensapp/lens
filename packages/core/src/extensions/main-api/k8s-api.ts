/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * @deprecated This function never works
 * @returns false
 */
export function isAllowedResource(...args: unknown[]) {
  return Boolean(void args);
}

export * from "../common-api/k8s-api";
