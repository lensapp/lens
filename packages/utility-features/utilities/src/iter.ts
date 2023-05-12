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
  toMap(): T extends readonly [infer K, infer V] ? Map<K, V[]> : never;
  toSet(): Set<T>;
  map<U>(fn: (val: T) => U): Iterator<U>;
  flatMap<U>(fn: (val: T) => U[]): Iterator<U>;
  concat(src2: IterableIterator<T>): Iterator<T>;
  join(sep?: string): string;
  take(count: number): Iterator<T>;
}

function chain<T>(src: IterableIterator<T>): Iterator<T> {
  return {
    filter: (fn) => chain(filter(src, fn)),
    filterMap: (fn) => chain(filterMap(src, fn)),
    map: (fn) => chain(map(src, fn)),
    flatMap: (fn) => chain(flatMap(src, fn)),
    find: (fn) => find(src, fn),
    join: (sep) => join(src, sep),
    collect: (fn) => fn(src),
    toArray: () => [...src],
    toMap: () => {
      const res = new Map();

      for (const item of src[Symbol.iterator]()) {
        const [key, val] = item as [unknown, unknown];
        const existing = res.get(key);

        if (existing) {
          existing.push(val);
        } else {
          res.set(key, [val]);
        }
      }

      return res as T extends readonly [infer K, infer V] ? Map<K, V[]> : never;
    },
    toSet: () => new Set(src),
    concat: (src2) => chain(concat(src, src2)),
    take: (count) => chain(take(src, count)),
    [Symbol.iterator]: () => src,
  };
}

/**
 * Create a new type safe empty Iterable
 * @returns An `Iterable` that yields 0 items
 */
function* newEmpty<T>(): IterableIterator<T> {}

/**
 * Creates a new `Iterable` that yields at most n items from src.
 * Does not modify `src` which can be used later.
 * @param src An initial iterator
 * @param n The maximum number of elements to take from src. Yields up to the floor of `n` and 0 items if n < 0
 */
function* take<T>(src: Iterable<T>, n: number): IterableIterator<T> {
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
function* map<T, U>(src: Iterable<T>, fn: (from: T) => U): IterableIterator<U> {
  for (const from of src) {
    yield fn(from);
  }
}

/**
 * The single layer flattening of an iterator, discarding `Falsy` values.
 * @param src A type that can be iterated over
 * @param fn The function that returns either an iterable over items that should be filtered out or a `Falsy` value indicating that it should be ignored
 */
function* filterFlatMap<T, U>(src: Iterable<T>, fn: (from: T) => Iterable<U | Falsy> | Falsy): IterableIterator<U> {
  for (const from of src) {
    if (!from) {
      continue;
    }

    const mapping = fn(from);

    if (!mapping) {
      continue;
    }

    for (const mapped of mapping) {
      if (mapped) {
        yield mapped;
      }
    }
  }
}

/**
 * Returns a new iterator that yields the items that each call to `fn` would produce
 * @param src A type that can be iterated over
 * @param fn A function that returns an iterator
 */
function* flatMap<T, U>(src: Iterable<T>, fn: (from: T) => Iterable<U>): IterableIterator<U> {
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
function* filter<T>(src: Iterable<T>, fn: (from: T) => any): IterableIterator<T> {
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
function* filterMap<T, U>(src: Iterable<T>, fn: (from: T) => U | Falsy): IterableIterator<U> {
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
function* filterMapStrict<T, U>(src: Iterable<T>, fn: (from: T) => U | null | undefined): IterableIterator<U> {
  for (const from of src) {
    const res = fn(from);

    if (res != null) {
      yield res;
    }
  }
}

/**
 * Iterate through `src` until `match` returns a truthy value
 * @param src A type that can be iterated over
 * @param match A function that should return a truthy value for the item that you want to find
 * @returns The first entry that `match` returns a truthy value for, or `undefined`
 */
function find<T>(src: Iterable<T>, match: (i: T) => any): T | undefined {
  for (const from of src) {
    if (match(from)) {
      return from;
    }
  }

  return void 0;
}

/**
 * Iterate over `src` calling `reducer` with the previous produced value and the current
 * yielded value until `src` is exhausted. Then return the final value.
 * @param src The value to iterate over
 * @param reducer A function for producing the next item from an accumulation and the current item
 * @param initial The initial value for the iteration
 */
function reduce<T, R extends Iterable<any>>(src: Iterable<T>, reducer: (acc: R, cur: T) => R, initial: R): R;

function reduce<T, R = T>(src: Iterable<T>, reducer: (acc: R, cur: T) => R, initial: R): R {
  let acc = initial;

  for (const item of src) {
    acc = reducer(acc, item);
  }

  return acc;
}

/**
 * A convenience function for reducing over an iterator of strings and concatenating them together
 * @param src The value to iterate over
 * @param connector The string value to intersperse between the yielded values
 * @returns The concatenated entries of `src` interspersed with copies of `connector`
 */
function join(src: IterableIterator<unknown>, connector = ","): string {
  const iterSrc = src[Symbol.iterator]();
  const first = iterSrc.next();

  if (first.done === true) {
    return "";
  }

  return reduce(iterSrc, (acc, cur) => `${acc}${connector}${cur}`, `${first.value}`);
}

/**
 * Iterate `n` times and then return the next value.
 * @param src The value to iterate over
 * @param n The zero-index value for the item to return to.
 */
function nth<T>(src: Iterable<T>, n: number): T | undefined {
  const iterator = src[Symbol.iterator]();

  while (n --> 0) {
    iterator.next();
  }

  return iterator.next().value;
}

/**
 * A convenience function to get the first item of an iterator
 * @param src The value to iterate over
 */
function first<T>(src: Iterable<T>): T | undefined {
  return nth(src, 0);
}

/**
 * Iterate through `src` and return `true` if `fn` returns a truthy value for every yielded value.
 * Otherwise, return `false`. This function short circuits.
 * @param src The type to be iterated over
 * @param fn A function to check each iteration
 */
function every<T>(src: Iterable<T>, fn: (val: T) => any): boolean {
  for (const val of src) {
    if (!fn(val)) {
      return false;
    }
  }

  return true;
}

function* concat<T>(...sources: IterableIterator<T>[]): IterableIterator<T> {
  for (const source of sources) {
    for (const val of source) {
      yield val;
    }
  }
}

/**
 * Split an iterable into several arrays with matching fields
 * @param from The iterable of items to split up
 * @param field The field of each item to split over
 * @param parts What each array will be filtered to
 * @returns A `parts.length` tuple of `T[]` where each array has matching `field` values
 */
function nFircate<T>(from: Iterable<T>, field: keyof T, parts: []): [];
function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field]]): [T[]];
function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field]]): [T[], T[]];
function nFircate<T>(from: Iterable<T>, field: keyof T, parts: [T[typeof field], T[typeof field], T[typeof field]]): [T[], T[], T[]];
function nFircate<T>(from: Iterable<T>, field: keyof T, parts: T[typeof field][]): T[][] {
  if (new Set(parts).size !== parts.length) {
    throw new TypeError("Duplicate parts entries");
  }

  const res = Array.from(parts, () => [] as T[]);

  for (const item of from) {
    const index = parts.indexOf(item[field]);

    if (index < 0) {
      continue;
    }

    res[index].push(item);
  }

  return res;
}

export const iter = {
  chain,
  concat,
  every,
  filter,
  filterFlatMap,
  filterMap,
  filterMapStrict,
  find,
  first,
  flatMap,
  join,
  map,
  nFircate,
  newEmpty,
  nth,
  reduce,
  take,
};
