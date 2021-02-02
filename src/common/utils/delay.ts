import { AbortController } from "abort-controller";

/**
 * Return a promise that will be resolved after at least `timeout` ms have
 * passed
 * @param timeout The number of milliseconds before resolving
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
