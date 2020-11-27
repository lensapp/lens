// Debouncing promise evaluation

export function debouncePromise<T, F extends any[]>(func: (...args: F) => T | Promise<T>, timeout = 0): (...args: F) => Promise<T> {
  let timer: NodeJS.Timeout;
  return (...params: any[]) => new Promise(resolve => {
    clearTimeout(timer);
    timer = global.setTimeout(() => resolve(func.apply(this, params)), timeout);
  });
}
