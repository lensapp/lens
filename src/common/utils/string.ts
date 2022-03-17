/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Transforms `val` so that the first character is uppercased
 */
export function uppercaseFirst(val: string): string {
  if (val.length === 0) {
    return "";
  }

  if (val.length === 1) {
    return val.toUpperCase();
  }

  const [first, ...rest] = val;

  return first.toUpperCase() + rest;
}
