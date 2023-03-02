/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A helper type for async functions that return a `Result`
 */
export type AsyncResult<Response, Error = string> = Promise<Result<Response, Error>>;

/**
 * Result describes the "error is just more data" pattern instead of using exceptions for
 * normal execution
 */
export type Result<Response, Error = string> =
  | (
    Response extends void
    ? { callWasSuccessful: true; response?: undefined }
    : { callWasSuccessful: true; response: Response }
  )
  | { callWasSuccessful: false; error: Error };
