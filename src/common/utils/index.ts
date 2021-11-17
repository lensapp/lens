/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * A function that does nothing
 */
export function noop<T extends any[]>(...args: T): void {
  return void args;
}

export * from "./app-version";
export * from "./autobind";
export * from "./camelCase";
export * from "./cloneJson";
export * from "./cluster-id-url-parsing";
export * from "./comparer";
export * from "./convertCpu";
export * from "./convertMemory";
export * from "./debouncePromise";
export * from "./defineGlobal";
export * from "./delay";
export * from "./disposer";
export * from "./downloadFile";
export * from "./escapeRegExp";
export * from "./extended-map";
export * from "./formatDuration";
export * from "./getRandId";
export * from "./hash-set";
export * from "./local-kubeconfig";
export * from "./n-fircate";
export * from "./objects";
export * from "./openExternal";
export * from "./paths";
export * from "./promise-exec";
export * from "./reactions";
export * from "./reject-promise";
export * from "./singleton";
export * from "./sort-compare";
export * from "./splitArray";
export * from "./tar";
export * from "./toggle-set";
export * from "./toJS";
export * from "./type-narrowing";
export * from "./types";

import * as iter from "./iter";
import * as array from "./array";
import * as tuple from "./tuple";
import * as base64 from "./base64";

export {
  iter,
  array,
  tuple,
  base64,
};
