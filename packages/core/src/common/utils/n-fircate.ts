/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Split an iterable into several arrays with matching fields
 * @param from The iterable of items to split up
 * @param field The field of each item to split over
 * @param parts What each array will be filtered to
 * @returns A `parts.length` tuple of `T[]` where each array has matching `field` values
 */
export function nFircate<T>(from: Iterable<T>, field: keyof T, parts: []): [];
export function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field]]): [T[]];
export function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field]]): [T[], T[]];
export function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field], T[typeof field]]): [T[], T[], T[]];

export function nFircate<T>(from: Iterable<T>, field: keyof T, parts: T[typeof field][]): T[][] {
  if (new Set(parts).size !== parts.length) {
    throw new TypeError("Duplicate parts entries");
  }

  const res = Array.from(parts, () => [] as T[]);

  for (const item of from) {
    const index = parts.indexOf(item[field]);

    if (index < 0) {
      continue;
    }

    res[index].push(item);
  }

  return res;
}
