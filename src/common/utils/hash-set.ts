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

import { action, IInterceptable, IInterceptor, IListenable, ISetWillChange, observable, ObservableMap, ObservableSet } from "mobx";

export * from "./hashers";

export function makeIterable<T>(iterator: Iterator<T>): IterableIterator<T> {
  (iterator as IterableIterator<T>)[Symbol.iterator] = () => iterator as IterableIterator<T>;

  return iterator as IterableIterator<T>;
}

export class ObservableHashSet<T> implements Set<T>, IInterceptable<ISetWillChange>, IListenable {
  #hashmap: ObservableMap<string, T>;

  get interceptors_(): IInterceptor<ISetWillChange<any>>[] {
    return [];
  }

  get changeListeners_(): Function[] {
    return [];
  }

  constructor(initialValues: Iterable<T>, protected hasher: (item: T) => string) {
    this.#hashmap = observable.map<string, T>(Array.from(initialValues, value => [this.hasher(value), value]), undefined);
  }

  @action
  replace(other: ObservableHashSet<T> | ObservableSet<T> | Set<T> | readonly T[]): this {
    if (Array.isArray(other)) {
      this.clear();
      other.forEach(value => this.add(value));
    } else if (other instanceof Set || other instanceof ObservableHashSet || other instanceof ObservableSet) {
      this.clear();
      other.forEach(value => this.add(value));
    } else if (other !== null && other !== undefined) {
      throw new Error(`ObservableHashSet: Cannot initialize set from ${other}`);
    }

    return this;
  }

  clear(): void {
    this.#hashmap.clear();
  }

  add(value: T): this {
    this.#hashmap.set(this.hasher(value), value);

    return this;
  }

  @action
  toggle(value: T) {
    const hash = this.hasher(value);

    if (this.#hashmap.has(hash)) {
      this.#hashmap.delete(hash);
    } else {
      this.#hashmap.set(hash, value);
    }
  }

  delete(value: T): boolean {
    return this.#hashmap.delete(this.hasher(value));
  }

  forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void {
    this.#hashmap.forEach(value => callbackfn(value, value, thisArg ?? this));
  }

  has(value: T): boolean {
    return this.#hashmap.has(this.hasher(value));
  }

  get size(): number {
    return this.#hashmap.size;
  }

  entries(): IterableIterator<[T, T]> {
    let nextIndex = 0;
    const keys = Array.from(this.keys());
    const values = Array.from(this.values());

    return makeIterable<[T, T]>({
      next() {
        const index = nextIndex++;

        return index < values.length
          ? { value: [keys[index], values[index]], done: false }
          : { done: true, value: undefined };
      }
    });
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  values(): IterableIterator<T> {
    let nextIndex = 0;
    const observableValues = Array.from(this.#hashmap.values());

    return makeIterable<T>({
      next: () => {
        return nextIndex < observableValues.length
          ? { value: observableValues[nextIndex++], done: false }
          : { done: true, value: undefined };
      }
    });
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.#hashmap.values();
  }

  get [Symbol.toStringTag](): string {
    return "Set";
  }

  toJSON(): T[] {
    return Array.from(this);
  }

  toString(): string {
    return "[object ObservableSet]";
  }
}
