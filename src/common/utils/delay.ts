import { AbortController } from "abort-controller";

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
