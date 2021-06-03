/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
