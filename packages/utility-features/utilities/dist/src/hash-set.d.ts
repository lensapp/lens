/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IInterceptable, IInterceptor, IListenable, ISetWillChange } from "mobx";
import { ObservableSet } from "mobx";
export declare function makeIterableIterator<T>(iterator: Iterator<T>): IterableIterator<T>;
export declare class HashSet<T> implements Set<T> {
    #private;
    protected hasher: (item: T) => string;
    constructor(initialValues: Iterable<T>, hasher: (item: T) => string);
    replace(other: ObservableHashSet<T> | ObservableSet<T> | Set<T> | readonly T[]): this;
    clear(): void;
    add(value: T): this;
    toggle(value: T): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    get size(): number;
    entries(): IterableIterator<[T, T]>;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    [Symbol.iterator](): IterableIterator<T>;
    get [Symbol.toStringTag](): string;
    toJSON(): T[];
    toString(): string;
}
export declare class ObservableHashSet<T> implements Set<T>, IInterceptable<ISetWillChange>, IListenable {
    #private;
    protected hasher: (item: T) => string;
    get interceptors_(): IInterceptor<ISetWillChange<T>>[];
    get changeListeners_(): Function[];
    constructor(initialValues: Iterable<T>, hasher: (item: T) => string);
    replace(other: ObservableHashSet<T> | ObservableSet<T> | Set<T> | readonly T[]): this;
    clear(): void;
    add(value: T): this;
    toggle(value: T): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, key: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    get size(): number;
    entries(): IterableIterator<[T, T]>;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    [Symbol.iterator](): IterableIterator<T>;
    get [Symbol.toStringTag](): string;
    toJSON(): T[];
    toString(): string;
}
