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

/**
 * Create a new type safe empty Iterable
 * @returns An `Iterable` that yields 0 items
 */
export function* newEmpty<T>(): Iterable<T> {
  return;
}

/**
 * Creates a new `Iterable` that yields at most n items from src.
 * Does not modify `src` which can be used later.
 * @param src An initial iterator
 * @param n The maximum number of elements to take from src. Yields up to the floor of `n` and 0 items if n < 0
 */
export function* take<T>(src: Iterable<T>, n: number): Iterable<T> {
  outer: for (let i = 0; i < n; i += 1) {
    for (const item of src) {
      yield item;
      continue outer;
    }

    // if we are here that means that `src` has been exhausted. Don't bother trying again.
    break outer;
  }
}

/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` for each item.
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
export function* map<T, U>(src: Iterable<T>, fn: (from: T) => U): Iterable<U> {
  for (const from of src) {
    yield fn(from);
  }
}

export function* flatMap<T, U>(src: Iterable<T>, fn: (from: T) => Iterable<U>): Iterable<U> {
  for (const from of src) {
    yield* fn(from);
  }
}

/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * items that return a `truthy` value from `fn`.
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
export function* filter<T>(src: Iterable<T>, fn: (from: T) => any): Iterable<T> {
  for (const from of src) {
    if (fn(from)) {
      yield from;
    }
  }
}

/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` when it is `truthy`
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
export function* filterMap<T, U>(src: Iterable<T>, fn: (from: T) => U): Iterable<U> {
  for (const from of src) {
    const res = fn(from);

    if (res) {
      yield res;
    }
  }
}

/**
 * Creates a new iterator that iterates (lazily) over its input and yields the
 * result of `fn` when it is not null or undefined
 * @param src A type that can be iterated over
 * @param fn The function that is called for each value
 */
export function* filterMapStrict<T, U>(src: Iterable<T>, fn: (from: T) => U): Iterable<U> {
  for (const from of src) {
    const res = fn(from);

    if (res != null) {
      yield res;
    }
  }
}
