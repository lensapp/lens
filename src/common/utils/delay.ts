/**
 * Return a promise that will be resolved after at least `timeout` ms have
 * passed
 * @param timeout The number of milliseconds before resolving
 */
export function delay(timeout = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
