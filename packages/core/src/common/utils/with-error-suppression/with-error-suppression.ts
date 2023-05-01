/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "lodash/fp";

export function withErrorSuppression<Params extends unknown[], Res>(toBeDecorated: (...args: Params) => Res): (...args: Params) => Res extends Promise<infer T> ? Promise<T | undefined> : Res | undefined {
  return ((...args: Params) => {
    try {
      const returnValue = toBeDecorated(...args);

      if ((returnValue) instanceof Promise) {
        return returnValue.catch(noop);
      }

      return returnValue;
    } catch (e) {
      return undefined;
    }
  }) as never;
}
