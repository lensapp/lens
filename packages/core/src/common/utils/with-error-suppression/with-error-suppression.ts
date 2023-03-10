/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { noop } from "lodash/fp";

export function withErrorSuppression<TDecorated extends (...args: any[]) => Promise<any>>(toBeDecorated: TDecorated): (...args: Parameters<TDecorated>) => ReturnType<TDecorated> | Promise<void>;
export function withErrorSuppression<TDecorated extends (...args: any[]) => any>(toBeDecorated: TDecorated): (...args: Parameters<TDecorated>) => ReturnType<TDecorated> | void;

export function withErrorSuppression(toBeDecorated: any) {
  return (...args: any[]) => {
    try {
      const returnValue = toBeDecorated(...args);

      if ((returnValue as any) instanceof Promise) {
        return returnValue.catch(noop);
      }

      return returnValue;
    } catch (e) {
      return undefined;
    }
  };
}
