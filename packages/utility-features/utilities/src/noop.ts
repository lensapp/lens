/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A function that does nothing
 */
export function noop<T extends any[]>(...args: T): void {
  return void args;
}

