/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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

/**
 * @deprecated Switch to doing toJS on each field instead
 */
export function toJS<T>(data: T): T {
  // make data observable for recursive toJS()-output
  if (typeof data === "object" && !isObservable(data)) {
    return mobx.toJS(observable.box(data).get());
  }

  return mobx.toJS(data);
}
