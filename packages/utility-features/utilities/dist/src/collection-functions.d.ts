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
export declare function getOrInsert<K, V>(map: Map<K, V>, key: K, value: V): V;
/**
 * Updates map and returns the value that was just inserted
 */
export declare function put<K, V>(map: Map<K, V>, key: K, value: V): V;
/**
 * Like `getOrInsert` but specifically for when `V` is `Map<MK, MV>` so that
 * the typings are inferred correctly.
 */
export declare function getOrInsertMap<K, MK, MV>(map: Map<K, Map<MK, MV>>, key: K): Map<MK, MV>;
/**
 * Like `getOrInsert` but specifically for when `V` is `Set<any>` so that
 * the typings are inferred.
 */
export declare function getOrInsertSet<K, SK>(map: Map<K, Set<SK>>, key: K): Set<SK>;
/**
 * A currying version of {@link getOrInsertSet}
 */
export declare function getOrInsertSetFor<K, SK>(map: Map<K, Set<SK>>): (key: K) => Set<SK>;
/**
 * Like `getOrInsert` but with delayed creation of the item. Which is useful
 * if it is very expensive to create the initial value.
 */
export declare function getOrInsertWith<K, V>(map: Map<K, V>, key: K, builder: () => V): V;
export declare function getOrInsertWith<K extends object, V>(map: Map<K, V> | WeakMap<K, V>, key: K, builder: () => V): V;
/**
 * Like {@link getOrInsertWith} but the builder is async and will be awaited before inserting into the map
 */
export declare function getOrInsertWithAsync<K, V>(map: Map<K, V>, key: K, asyncBuilder: () => Promise<V>): Promise<V>;
/**
 * Insert `val` into `map` under `key` and then get the value back
 */
export declare function setAndGet<K, V>(map: Map<K, V>, key: K, val: V): V;
/**
 * Set the value associated with `key` iff there was not a previous value
 * @param map The map to interact with
 * @throws if `key` already in map
 * @returns `this` so that `strictSet` can be chained
 */
export declare function strictSet<K, V>(map: Map<K, V>, key: K, val: V): typeof map;
/**
 * Get the value associated with `key`
 * @param map The map to interact with
 * @throws if `key` did not a value associated with it
 */
export declare function strictGet<K, V>(map: Map<K, V>, key: K): V;
/**
 * If `key` is in `set`, remove it otherwise add it.
 * @param set The set to manipulate
 * @param key The key to toggle the "is in"-ness of
 */
export declare function toggle<K>(set: Set<K>, key: K): void;
/**
 * A helper function to also check for defined-ness
 */
export declare function includes<T>(src: T[], value: T | null | undefined): boolean;
