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

export class DuplicateKeyError extends Error {
  constructor(public key: any) {
    super("Duplicate key in map");
  }
}

export class StrictMap<K, V> extends Map<K, V> {
  /**
   * @throws if `key` already in map
   */
  strictSet(key: K, val: V): this {
    if (this.has(key)) {
      throw new DuplicateKeyError(key);
    }

    return this.set(key, val);
  }
}

export class ExtendedMap<K, V> extends StrictMap<K, V> {
  static new<K, MK, MV>(): ExtendedMap<K, Map<MK, MV>> {
    return new ExtendedMap<K, Map<MK, MV>>(() => new Map<MK, MV>());
  }

  static newExtended<K, MK, MV>(getDefault: () => MV): ExtendedMap<K, ExtendedMap<MK, MV>> {
    return new ExtendedMap<K, ExtendedMap<MK, MV>>(() => new ExtendedMap<MK, MV>(getDefault));
  }

  static newExtendedStrict<K, MK, MMK, MMV>(): ExtendedMap<K, ExtendedMap<MK, StrictMap<MMK, MMV>>> {
    return new ExtendedMap<K, ExtendedMap<MK, StrictMap<MMK, MMV>>>(() => new ExtendedMap<MK, StrictMap<MMK, MMV>>(() => new StrictMap<MMK, MMV>()));
  }

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
