/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Result<Value, Error = string> =
  | (
    Value extends void
    ? { isOk: true; value?: undefined; error?: never }
    : { isOk: true; value: Value; error?: never }
  )
  | { isOk: false; value?: never; error: Error };

export type AsyncResult<Response, Error = string> =
  | (
    Response extends void
    ? { callWasSuccessful: true; response?: undefined }
    : { callWasSuccessful: true; response: Response }
  )
  | { callWasSuccessful: false; error: Error };
