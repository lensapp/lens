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

import * as array from "../utils/array";

/**
 * A strict N-tuple of type T
 */
export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N ? R : _TupleOf<T, N, [T, ...R]>;

/**
 * Iterates over `sources` yielding full tuples until one of the tuple arrays
 * is empty. Then it returns a tuple with the rest of each of tuples
 * @param sources The source arrays
 * @yields A tuple of the next element from each of the sources
 * @returns The tuple of all the sources as soon as at least one of the sources is exausted
 */
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
