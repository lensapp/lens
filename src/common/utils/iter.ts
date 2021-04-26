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
