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

import { action, IEnhancer, IObservableMapInitialValues, ObservableMap } from "mobx";

export class ExtendedMap<K, V> extends Map<K, V> {
  constructor(protected getDefault: () => V, entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
  }

  getOrInsert(key: K, val: V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, val).get(key);
  }

  getOrInsertWith(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }

  getOrDefault(key: K): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, this.getDefault()).get(key);
  }
}

export class ExtendedObservableMap<K, V> extends ObservableMap<K, V> {
  constructor(protected getDefault: () => V, initialData?: IObservableMapInitialValues<K, V>, enhancer?: IEnhancer<V>, name?: string) {
    super(initialData, enhancer, name);
  }

  @action
  getOrInsert(key: K, val: V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, val).get(key);
  }

  @action
  getOrInsertWith(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }

  @action
  getOrDefault(key: K): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, this.getDefault()).get(key);
  }
}
