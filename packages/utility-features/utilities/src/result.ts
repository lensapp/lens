/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A helper type for async functions that return a `Result`
 */
export type AsyncResult<Value, Err> = Promise<Result<Value, Err>>;

/**
 * Result describes the "error is just more data" pattern instead of using exceptions for
 * normal execution
 */
export type Result<Value, Err> =
  | OkResult<Value>
  | ErrorResult<Err>;

export type ErrorResult<Err> = { readonly isOk: false; readonly error: Err };
export type OkResult<Value> = (
  Value extends void
  ? { readonly isOk: true; readonly value?: undefined }
  : { readonly isOk: true; readonly value: Value }
);

export const result = {
  ok: <Value>(value: Value) => ({
    isOk: true,
    value: value,
  }) as OkResult<Value>,
  error: <Err>(error: Err) => ({
    isOk: false,
    error,
  }) as ErrorResult<Err>,
  wrapError: <Err>(error: string, cause: ErrorResult<Err>) => ({
    isOk: false,
    error: new Error(error, { cause: cause.error }),
  }) as ErrorResult<Error>,
}
