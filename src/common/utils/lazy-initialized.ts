/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A OnceCell is an object that wraps some function that produces a value.
 *
 * It then only calls the function on the first call to `get()` and returns the
 * same instance/value on every subsequent call.
 */
export interface LazyInitialized<T> {
  get(): T;
}

/**
 * A function to make a `OnceCell<T>`
 */
export function lazyInitialized<T>(builder: () => T): LazyInitialized<T> {
  let value: T | undefined;
  let called = false;

  return {
    get() {
      if (called) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return value!;
      }

      value = builder();
      called = true;

      return value;
    },
  };
}
