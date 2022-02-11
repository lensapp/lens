/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A better typed version of `Object.fromEntries` where the keys are known to
 * be a specific subset
 */
export function fromEntries<T, Key extends string>(entries: Iterable<readonly [Key, T]>): { [k in Key]: T } {
  return Object.fromEntries(entries) as { [k in Key]: T };
}

export function entries<Key extends string, T>(obj: Record<Key, T>): [Key, T][] {
  return Object.entries(obj) as [Key, T][];
}
