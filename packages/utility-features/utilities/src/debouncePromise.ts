/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Debouncing promise evaluation

export function debouncePromise<T, F extends any[]>(func: (...args: F) => T | Promise<T>, timeout = 0): (...args: F) => Promise<T> {
  let timer: NodeJS.Timeout;

  return (...params: F) => new Promise(resolve => {
    clearTimeout(timer);
    timer = setTimeout(() => resolve(func(...params)), timeout);
  });
}
