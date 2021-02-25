import "abort-controller/polyfill";

/**
 * Creates a new promise that will be rejected when the signal rejects.
 *
 * Useful for `Promise.race()` applications.
 * @param signal The AbortController's signal to reject with
 */
export function rejectPromiseBy(signal: AbortSignal): Promise<void> {
  return new Promise((_, reject) => {
    signal.addEventListener("abort", reject);
  });
}
