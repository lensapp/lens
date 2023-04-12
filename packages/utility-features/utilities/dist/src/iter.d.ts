/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export type Falsy = false | 0 | "" | null | undefined;
interface Iterator<T> extends Iterable<T> {
    filter(fn: (val: T) => unknown): Iterator<T>;
    filterMap<U>(fn: (val: T) => Falsy | U): Iterator<U>;
    find(fn: (val: T) => unknown): T | undefined;
    collect<U>(fn: (values: Iterable<T>) => U): U;
    toArray(): T[];
    toMap(): T extends [infer K, infer V] ? Map<K, V> : never;
    toSet(): Set<T>;
    map<U>(fn: (val: T) => U): Iterator<U>;
    flatMap<U>(fn: (val: T) => U[]): Iterator<U>;
    concat(src2: IterableIterator<T>): Iterator<T>;
    join(sep?: string): string;
    take(count: number): Iterator<T>;
}
declare function chain<T>(src: IterableIterator<T>): Iterator<T>;
/**
 * Create a new type safe empty Iterable
 * @returns An `Iterable` that yields 0 items
 */
declare function newEmpty<T>(): IterableIterator<T>;
/**
 * Creates a new `Iterable` that yields at most n items from src.
 * Does not modify `src` which can be used later.
 * @param src An initial iterator
 * @param n The maximum number of elements to take from src. Yields up to the floor of `n` and 0 items if n < 0
 */
declare function take<T>(src: Iterable<T>, n: number): IterableIterator<T>;
/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` for each item.
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
declare function map<T, U>(src: Iterable<T>, fn: (from: T) => U): IterableIterator<U>;
/**
 * The single layer flattening of an iterator, discarding `Falsy` values.
 * @param src A type that can be iterated over
 * @param fn The function that returns either an iterable over items that should be filtered out or a `Falsy` value indicating that it should be ignored
 */
declare function filterFlatMap<T, U>(src: Iterable<T>, fn: (from: T) => Iterable<U | Falsy> | Falsy): IterableIterator<U>;
/**
 * Returns a new iterator that yields the items that each call to `fn` would produce
 * @param src A type that can be iterated over
 * @param fn A function that returns an iterator
 */
declare function flatMap<T, U>(src: Iterable<T>, fn: (from: T) => Iterable<U>): IterableIterator<U>;
/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * items that return a `truthy` value from `fn`.
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
declare function filter<T>(src: Iterable<T>, fn: (from: T) => any): IterableIterator<T>;
/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` when it is `truthy`
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
declare function filterMap<T, U>(src: Iterable<T>, fn: (from: T) => U | Falsy): IterableIterator<U>;
/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` when it is not null or undefined
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
declare function filterMapStrict<T, U>(src: Iterable<T>, fn: (from: T) => U | null | undefined): IterableIterator<U>;
/**
 * Iterate through `src` until `match` returns a truthy value
 * @param src A type that can be iterated over
 * @param match A function that should return a truthy value for the item that you want to find
 * @returns The first entry that `match` returns a truthy value for, or `undefined`
 */
declare function find<T>(src: Iterable<T>, match: (i: T) => any): T | undefined;
/**
 * Iterate over `src` calling `reducer` with the previous produced value and the current
 * yielded value until `src` is exhausted. Then return the final value.
 * @param src The value to iterate over
 * @param reducer A function for producing the next item from an accumulation and the current item
 * @param initial The initial value for the iteration
 */
declare function reduce<T, R extends Iterable<any>>(src: Iterable<T>, reducer: (acc: R, cur: T) => R, initial: R): R;
/**
 * A convenience function for reducing over an iterator of strings and concatenating them together
 * @param src The value to iterate over
 * @param connector The string value to intersperse between the yielded values
 * @returns The concatenated entries of `src` interspersed with copies of `connector`
 */
declare function join(src: IterableIterator<unknown>, connector?: string): string;
/**
 * Iterate `n` times and then return the next value.
 * @param src The value to iterate over
 * @param n The zero-index value for the item to return to.
 */
declare function nth<T>(src: Iterable<T>, n: number): T | undefined;
/**
 * A convenience function to get the first item of an iterator
 * @param src The value to iterate over
 */
declare function first<T>(src: Iterable<T>): T | undefined;
/**
 * Iterate through `src` and return `true` if `fn` returns a truthy value for every yielded value.
 * Otherwise, return `false`. This function short circuits.
 * @param src The type to be iterated over
 * @param fn A function to check each iteration
 */
declare function every<T>(src: Iterable<T>, fn: (val: T) => any): boolean;
declare function concat<T>(...sources: IterableIterator<T>[]): IterableIterator<T>;
/**
 * Split an iterable into several arrays with matching fields
 * @param from The iterable of items to split up
 * @param field The field of each item to split over
 * @param parts What each array will be filtered to
 * @returns A `parts.length` tuple of `T[]` where each array has matching `field` values
 */
declare function nFircate<T>(from: Iterable<T>, field: keyof T, parts: []): [];
declare function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field]]): [T[]];
declare function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field]]): [T[], T[]];
declare function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field], T[typeof field]]): [T[], T[], T[]];
export declare const iter: {
    chain: typeof chain;
    concat: typeof concat;
    every: typeof every;
    filter: typeof filter;
    filterFlatMap: typeof filterFlatMap;
    filterMap: typeof filterMap;
    filterMapStrict: typeof filterMapStrict;
    find: typeof find;
    first: typeof first;
    flatMap: typeof flatMap;
    join: typeof join;
    map: typeof map;
    nFircate: typeof nFircate;
    newEmpty: typeof newEmpty;
    nth: typeof nth;
    reduce: typeof reduce;
    take: typeof take;
};
export {};
