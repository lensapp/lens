/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IInterceptable, IInterceptor, IListenable, ISetWillChange, ObservableMap } from "mobx";
import { observable, ObservableSet, runInAction } from "mobx";

export function makeIterableIterator<T>(iterator: Iterator<T>): IterableIterator<T> {
  (iterator as IterableIterator<T>)[Symbol.iterator] = () => iterator as IterableIterator<T>;

  return iterator as IterableIterator<T>;
}

export class HashSet<T> implements Set<T> {
  #hashmap: Map<string, T>;

  constructor(initialValues: Iterable<T>, protected hasher: (item: T) => string) {
    this.#hashmap = new Map<string, T>(Array.from(initialValues, value => [this.hasher(value), value]));
  }

  replace(other: ObservableHashSet<T> | ObservableSet<T> | Set<T> | readonly T[]): this {
    if (other === null || other === undefined) {
      return this;
    }

    if (!(Array.isArray(other) || other instanceof Set || other instanceof ObservableHashSet || other instanceof ObservableSet)) {
      throw new Error(`ObservableHashSet: Cannot initialize set from ${other}`);
    }

    this.clear();

    for (const value of other) {
      this.add(value);
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

  toggle(value: T): void {
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

    return makeIterableIterator<[T, T]>({
      next() {
        const index = nextIndex++;

        return index < values.length
          ? { value: [keys[index], values[index]], done: false }
          : { done: true, value: undefined };
      },
    });
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  values(): IterableIterator<T> {
    let nextIndex = 0;
    const observableValues = Array.from(this.#hashmap.values());

    return makeIterableIterator<T>({
      next: () => {
        return nextIndex < observableValues.length
          ? { value: observableValues[nextIndex++], done: false }
          : { done: true, value: undefined };
      },
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
    return "[object Set]";
  }
}

export class ObservableHashSet<T> implements Set<T>, IInterceptable<ISetWillChange>, IListenable {
  #hashmap: ObservableMap<string, T>;

  get interceptors_(): IInterceptor<ISetWillChange<T>>[] {
    return [];
  }

  get changeListeners_(): Function[] {
    return [];
  }

  constructor(initialValues: Iterable<T>, protected hasher: (item: T) => string) {
    this.#hashmap = observable.map<string, T>(Array.from(initialValues, value => [this.hasher(value), value]), undefined);
  }

  replace(other: ObservableHashSet<T> | ObservableSet<T> | Set<T> | readonly T[]): this {
    return runInAction(() => {
      if (other === null || other === undefined) {
        return this;
      }

      if (!(Array.isArray(other) || other instanceof Set || other instanceof ObservableHashSet || other instanceof ObservableSet)) {
        throw new Error(`ObservableHashSet: Cannot initialize set from ${other}`);
      }

      this.clear();

      for (const value of other) {
        this.add(value);
      }

      return this;
    });
  }

  clear(): void {
    this.#hashmap.clear();
  }

  add(value: T): this {
    this.#hashmap.set(this.hasher(value), value);

    return this;
  }

  toggle(value: T): void {
    runInAction(() => {
      const hash = this.hasher(value);

      if (this.#hashmap.has(hash)) {
        this.#hashmap.delete(hash);
      } else {
        this.#hashmap.set(hash, value);
      }
    });
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

    return makeIterableIterator<[T, T]>({
      next() {
        const index = nextIndex++;

        return index < values.length
          ? { value: [keys[index], values[index]], done: false }
          : { done: true, value: undefined };
      },
    });
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  values(): IterableIterator<T> {
    let nextIndex = 0;
    const observableValues = Array.from(this.#hashmap.values());

    return makeIterableIterator<T>({
      next: () => {
        return nextIndex < observableValues.length
          ? { value: observableValues[nextIndex++], done: false }
          : { done: true, value: undefined };
      },
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
