// Debouncing promise evaluation

export const debouncePromise = function (promisedFunc: Function, timeout = 0) {
  let timer: number;
  return (...params: any[]) => new Promise((resolve, reject) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => resolve(promisedFunc.apply(this, params)), timeout);
  });
};
