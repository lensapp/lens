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
 * Get the value behind `key`. If it was not pressent, first insert `value`
 * @param map The map to interact with
 * @param key The key to insert into the map with
 * @param value The value to optional add to the map
 * @returns The value in the map
 */
export function getOrInsert<K, V>(map: Map<K, V>, key: K, value: V): V {
  if (map.has(key)) {
    return map.get(key);
  }

  return map.set(key, value).get(key);
}

/**
 * Get the value behind `key`. If it was not pressent, first insert the value returned by `getVal`
 *
 * This function should be used over `getInsertWith` if it is expensive to build a `V`
 * @param map The map to interact with
 * @param key The key to insert into the map with
 * @param builder A function that returns a new instance of `V`.
 * @returns The value in the map
 */
export function getOrInsertWith<K, V>(map: Map<K, V>, key: K, builder: () => V): V {
  if (map.has(key)) {
    return map.get(key);
  }

  return map.set(key, builder()).get(key);
}

/**
 * Set the value associated with `key` iff there was not a previous value
 * @param map The map to interact with
 * @throws if `key` already in map
 * @returns `this` so that `strictSet` can be chained
 */
export function strictSet<K, V>(map: Map<K, V>, key: K, val: V): typeof map {
  if (map.has(key)) {
    throw new TypeError("Duplicate key in map");
  }

  return map.set(key, val);
}

/**
 * Get the value associated with `key`
 * @param map The map to interact with
 * @throws if `key` did not a value associated with it
 */
export function strictGet<K, V>(map: Map<K, V>, key: K): V {
  if (!map.has(key)) {
    throw new TypeError("key not in map");
  }

  return map.get(key);
}

/**
 * Toggles the "has" in `set` of `value`
 * @param set The set to interact with
 * @param value The value to either add if not present or remove if present from `set`
 */
export function toggle<T>(set: Set<T>, value: T): void {
  if (!set.delete(value)) {
    // Set.prototype.delete returns false if `value` was not in the set
    set.add(value);
  }
}
