/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "lodash/fp";

export function withErrorSuppression<TDecorated extends (...args: any[]) => Promise<void>>(toBeDecorated: TDecorated): (...args: Parameters<TDecorated>) => Promise<void>;
export function withErrorSuppression<TDecorated extends (...args: any[]) => void>(toBeDecorated: TDecorated): (...args: Parameters<TDecorated>) => void;

export function withErrorSuppression(toBeDecorated: any) {
  return (...args: any[]) => {
    try {
      const returnValue = toBeDecorated(...args);

      if (isPromise(returnValue)) {
        return returnValue.catch(noop);
      }

      return returnValue;
    } catch (e) {
      return undefined;
    }
  };
}

function isPromise(reference: any): reference is Promise<any> {
  return !!reference?.then;
}
