/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Creates a new promise that will be rejected when the signal rejects.
 *
 * Useful for `Promise.race()` applications.
 * @param signal The AbortController's signal to reject with
 */
export function rejectPromiseBy(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    signal.addEventListener("abort", reject);
  });
}
