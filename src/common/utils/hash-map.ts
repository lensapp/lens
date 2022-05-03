/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

function makeIterableIterator<T>(iterator: Iterator<T>): IterableIterator<T> {
  (iterator as IterableIterator<T>)[Symbol.iterator] = () => iterator as IterableIterator<T>;

  return iterator as IterableIterator<T>;
}

export class HashMap<K, V> implements Map<K, V> {
  #hashmap: Map<string, { key: K; value: V }>;

  constructor(protected hasher: (key: K) => string, initialValues?: Iterable<readonly [K, V]>) {
    this.#hashmap = new Map();

    if (initialValues) {
      for (const [key, value] of initialValues) {
        this.#hashmap.set(this.hasher(key), { key, value });
      }
    }
  }

  clear(): void {
    this.#hashmap.clear();
  }

  delete(key: K): boolean {
    return this.#hashmap.delete(this.hasher(key));
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.#hashmap.forEach(entry => callbackfn(entry.value, entry.key, thisArg ?? this));
  }

  get(key: K): V | undefined {
    return this.#hashmap.get(this.hasher(key))?.value;
  }

  has(key: K): boolean {
    return this.#hashmap.has(this.hasher(key));
  }

  set(key: K, value: V): this {
    this.#hashmap.set(this.hasher(key), { key, value });

    return this;
  }

  get size(): number {
    return this.#hashmap.size;
  }

  entries(): IterableIterator<[K, V]> {
    let nextIndex = 0;
    const keys = Array.from(this.keys());
    const values = Array.from(this.values());

    return makeIterableIterator<[K, V]>({
      next() {
        const index = nextIndex++;

        return index < values.length
          ? { value: [keys[index], values[index]], done: false }
          : { done: true, value: undefined };
      },
    });
  }

  keys(): IterableIterator<K> {
    let nextIndex = 0;
    const observableValues = Array.from(this.#hashmap.values());

    return makeIterableIterator<K>({
      next: () => {
        return nextIndex < observableValues.length
          ? { value: observableValues[nextIndex++].key, done: false }
          : { done: true, value: undefined };
      },
    });
  }

  values(): IterableIterator<V> {
    let nextIndex = 0;
    const observableValues = Array.from(this.#hashmap.values());

    return makeIterableIterator<V>({
      next: () => {
        return nextIndex < observableValues.length
          ? { value: observableValues[nextIndex++].value, done: false }
          : { done: true, value: undefined };
      },
    });
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  get [Symbol.toStringTag]() {
    return "Map";
  }
}
