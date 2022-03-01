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
export interface OnceCell<T> {
  get(): T;
}

/**
 * A function to make a `OnceCell<T>`
 */
export function onceCell<T>(builder: () => T): OnceCell<T> {
  let value: T | undefined;
  let called = false;

  return {
    get() {
      if (called) {
        return value;
      }

      called = true;

      return value = builder();
    },
  };
}
