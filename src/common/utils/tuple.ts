/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as array from "../utils/array";

/**
 * A strict N-tuple of type T
 */
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : TupleOfImpl<T, N, []>
  : never;
type TupleOfImpl<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : TupleOfImpl<T, N, [T, ...R]>;

/**
 * Iterates over `sources` yielding full tuples until one of the tuple arrays
 * is empty. Then it returns a tuple with the rest of each of tuples
 * @param sources The source arrays
 * @yields A tuple of the next element from each of the sources
 * @returns The tuple of all the sources as soon as at least one of the sources is exausted
 */
export function zip<T>(src1: T[]): Iterator<[T], Tuple<T[], 1>>;
export function zip<T>(src1: T[], src2: T[]): Iterator<[T, T], Tuple<T[], 2>>;

export function* zip<T, N extends number>(...sources: Tuple<T[], N>): Iterator<Tuple<T, N>, Tuple<T[], N>> {
  const maxSafeLength = Math.min(...sources.map(source => source.length));

  for (let i = 0; i < maxSafeLength; i += 1) {
    yield sources.map(source => source[i]) as Tuple<T, N>;
  }

  return sources.map(source => source.slice(maxSafeLength)) as Tuple<T[], N>;
}

/**
 * Returns a `length` tuple filled with copies of `value`
 * @param length The size of the tuple
 * @param value The value for each of the tuple entries
 */
export function filled<T, L extends number>(length: L, value: T): Tuple<T, L> {
  return array.filled(length, value) as Tuple<T, L>;
}

/**
 * A function for converting an explicit array to a tuple but without the `readonly` typing
 */
export function from<T extends any[]>(...args: T): [...T] {
  return args;
}
