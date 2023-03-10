/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncResult, Result } from "./result";
import { delay } from "./delay";
import { noop } from "./noop";

/**
 * @param error The error that resulted in the failure
 * @param attempt The 1-index attempt count
 */
export type OnIntermediateError<E> = (error: E, attempt: number) => void;

export interface BackoffCallerOptions<E> {
  /**
   * Called when an attempt fails
   */
  onIntermediateError?: OnIntermediateError<E>;

  /**
   * @default 5
   */
  maxAttempts?: number;

  /**
   * In milliseconds
   * @default 1000
   */
  initialTimeout?: number;

  /**
   * @default 2
   */
  scaleFactor?: number;
}

/**
 * Calls `fn` once and then again (with exponential delay between each attempt) up to `options.maxAttempts` times.
 * @param fn The function to repeatedly attempt
 * @returns The first success or the last failure
 */
export const backoffCaller = async <T, E>(fn: () => AsyncResult<T, E>, options?: BackoffCallerOptions<E>): AsyncResult<T, E> => {
  const {
    initialTimeout = 1000,
    maxAttempts = 5,
    onIntermediateError = noop as OnIntermediateError<E>,
    scaleFactor = 2,
  } = options ?? {};

  let timeout = initialTimeout;
  let attempt = 0;
  let result: Result<T, E>;

  do {
    result = await fn();

    if (result.callWasSuccessful) {
      return result;
    }

    onIntermediateError(result.error, attempt + 1);

    await delay(timeout);
    timeout *= scaleFactor;
  } while (attempt += 1, attempt < maxAttempts);

  return result;
};
