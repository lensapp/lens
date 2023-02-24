/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type AbortController from "abort-controller";
import type { Disposer } from "./disposer";
import { disposer } from "./disposer";

/**
 * Return a promise that will be resolved after at least `timeout` ms have
 * passed. If `failFast` is provided then the promise is also resolved if it has
 * been aborted.
 * @param timeout The number of milliseconds before resolving
 * @param failFast An abort controller instance to cause the delay to short-circuit
 */
export function delay(timeout = 1000, failFast?: AbortController): Promise<void> & { cancel: Disposer } {
  const cancel = disposer();

  return Object.assign(new Promise<void>(resolve => {
    const timeoutId = setTimeout(resolve, timeout);

    cancel.push(() => clearTimeout(timeoutId));

    if (failFast) {
      const onAbort = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      failFast.signal.addEventListener("abort", onAbort);
      cancel.push(() => failFast.signal.removeEventListener("abort", onAbort));
    }
  }), { cancel });
}
