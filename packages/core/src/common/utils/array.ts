/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A inference typed version of `Array(length).fill(value)`
 * @param length The number of entries
 * @param value The value of each of the indices
 */
export function filled<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}
