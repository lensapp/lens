/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, ObservableMap } from "mobx";

export function multiSet<T, V>(map: Map<T, V>, newEntries: [T, V][]): void {
  for (const [key, val] of newEntries) {
    map.set(key, val);
  }
}

export class ExtendedMap<K, V> extends Map<K, V> {
  static new<K, V>(entries?: readonly (readonly [K, V])[] | null): ExtendedMap<K, V> {
    return new ExtendedMap<K, V>(entries);
  }

  /**
   * Get the value behind `key`. If it was not present, first insert the value returned by `getVal`
   * @param key The key to insert into the map with
   * @param getVal A function that returns a new instance of `V`.
   * @returns The value in the map
   */
  getOrInsert(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }

  /**
   * Set the value associated with `key` iff there was not a previous value
   * @throws if `key` already in map
   * @returns `this` so that `strictSet` can be chained
   */
  strictSet(key: K, val: V): this {
    if (this.has(key)) {
      throw new TypeError("Duplicate key in map");
    }

    return this.set(key, val);
  }

  /**
   * Get the value associated with `key`
   * @throws if `key` did not a value associated with it
   */
  strictGet(key: K): V {
    if (!this.has(key)) {
      throw new TypeError("key not in map");
    }

    return this.get(key);
  }
}

export class ExtendedObservableMap<K, V> extends ObservableMap<K, V> {
  @action
  getOrInsert(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }
}
