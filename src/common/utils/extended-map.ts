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

import { action, ObservableMap } from "mobx";

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
