// Debouncing promise evaluation

export const debouncePromise = function (promisedFunc: Function, timeout = 0): (...params: any[]) => Promise<any> {
  let timer: number;
  return (...params: any[]): Promise<any> => new Promise((resolve, _reject) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => resolve(promisedFunc.apply(this, params)), timeout);
  });
};
