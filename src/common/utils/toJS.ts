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
 * Wrapper for mobx.toJS() to support partially observable objects as data-input (>= mobx6).
 * Otherwise, output result won't be recursively converted to corresponding plain JS-structure.
 *
 * @example
 *  mobx.toJS({one: 1, two: observable.array([2])}); // "data.two" == ObservableArray<number>
 */
import * as mobx from "mobx";
import { isObservable, observable } from "mobx";

export function toJS<T>(data: T): T {
  // make data observable for recursive toJS()-output
  if (typeof data === "object" && !isObservable(data)) {
    return mobx.toJS(observable.box(data).get());
  }

  return mobx.toJS(data);
}
