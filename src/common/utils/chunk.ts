/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Tuple } from "./tuple";

/**
 * Will yield consecutive chunks of `size` length. If `src.length` is not a multiple of `size`
 * then the final values will be iterated over but not yielded.
 * @param src The original array
 * @param size The size of the chunks
 */
export function* chunkSkipEnd<T, Size extends number>(src: Iterable<T>, size: Size): IterableIterator<Tuple<T, Size>> {
  if (size <= 0) {
    return;
  }

  const iter = src[Symbol.iterator]();

  for (;;) {
    const chunk = [];

    for (let i = 0; i < size; i += 1) {
      const result = iter.next();

      if (result.done === true) {
        return;
      }

      chunk.push(result.value);
    }

    yield chunk as Tuple<T, Size>;
  }
}
