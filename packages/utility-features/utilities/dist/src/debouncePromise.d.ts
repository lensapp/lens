/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export declare function debouncePromise<T, F extends any[]>(func: (...args: F) => T | Promise<T>, timeout?: number): (...args: F) => Promise<T>;
