/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { runInAction } from "mobx";
import { inspect } from "util";
import { isDefined } from "./type-narrowing";

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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return map.get(key)!;
}

/**
 * Updates map and returns the value that was just inserted
 */
export function put<K, V>(map: Map<K, V>, key: K, value: V): V {
  map.set(key, value);

  return value;
}

/**
 * Like `getOrInsert` but specifically for when `V` is `Map<MK, MV>` so that
 * the typings are inferred correctly.
 */
export function getOrInsertMap<K, MK, MV>(map: Map<K, Map<MK, MV>>, key: K): Map<MK, MV> {
  return getOrInsert(map, key, new Map<MK, MV>());
}

/**
 * Like `getOrInsert` but specifically for when `V` is `Set<any>` so that
 * the typings are inferred.
 */
export function getOrInsertSet<K, SK>(map: Map<K, Set<SK>>, key: K): Set<SK> {
  return getOrInsert(map, key, new Set<SK>());
}

/**
 * Like `getOrInsert` but with delayed creation of the item. Which is useful
 * if it is very expensive to create the initial value.
 */
export function getOrInsertWith<K, V>(map: Map<K, V>, key: K, builder: () => V): V {
  if (!map.has(key)) {
    map.set(key, builder());
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return map.get(key)!;
}

/**
 * Like {@link getOrInsertWith} but the builder is async and will be awaited before inserting into the map
 */
export async function getOrInsertWithAsync<K, V>(map: Map<K, V>, key: K, asyncBuilder: () => Promise<V>): Promise<V> {
  if (!map.has(key)) {
    map.set(key, await asyncBuilder());
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return map.get(key)!;
}

/**
 * Set the value associated with `key` iff there was not a previous value
 * @param map The map to interact with
 * @throws if `key` already in map
 * @returns `this` so that `strictSet` can be chained
 */
export function strictSet<K, V>(map: Map<K, V>, key: K, val: V): typeof map {
  if (map.has(key)) {
    throw new TypeError(`Map already contains key: ${inspect(key)}`);
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
    throw new TypeError(`Map does not contains key: ${inspect(key)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return map.get(key)!;
}

/**
 * If `key` is in `set`, remove it otherwise add it.
 * @param set The set to manipulate
 * @param key The key to toggle the "is in"-ness of
 */
export function toggle<K>(set: Set<K>, key: K): void {
  runInAction(() => {
    // Returns true if value was already in Set; otherwise false.
    if (!set.delete(key)) {
      set.add(key);
    }
  });
}

/**
 * A helper function to also check for defined-ness
 */
export function includes<T>(src: T[], value: T | null | undefined): boolean {
  return isDefined(value) && src.includes(value);
}
