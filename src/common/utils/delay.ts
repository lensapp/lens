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

import type { AbortController } from "abort-controller";

/**
 * Return a promise that will be resolved after at least `timeout` ms have
 * passed. If `failFast` is provided then the promise is also resolved if it has
 * been aborted.
 * @param timeout The number of milliseconds before resolving
 * @param failFast An abort controller instance to cause the delay to short-circuit
 */
export function delay(timeout = 1000, failFast?: AbortController): Promise<void> {
  return new Promise(resolve => {
    const timeoutId = setTimeout(resolve, timeout);

    failFast?.signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      resolve();
    });
  });
}
