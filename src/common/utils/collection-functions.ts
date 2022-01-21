/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Get the value behind `key`. If it was not present, first insert `value`
 * @param map The map to interact with
 * @param key The key to insert into the map with
 * @param value The value to optional add to the map
 * @returns The value in the map
 */
export function getOrInsert<K, V>(map: Map<K, V>, key: K, value: V): V {
  if (!map.has(key)) {
    map.set(key, value);
  }

  return map.get(key);
}

/**
 * Like `getOrInsert` but specifically for when `V` is `Map<any, any>` so that
 * the typings are inferred.
 */
export function getOrInsertMap<K, MK, MV>(map: Map<K, Map<MK, MV>>, key: K): Map<MK, MV> {
  return getOrInsert(map, key, new Map<MK, MV>());
}
