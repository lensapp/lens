/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export type AsyncResult<Response, Error = string> =
  | (
    Response extends void
    ? { callWasSuccessful: true; response?: undefined }
    : { callWasSuccessful: true; response: Response }
  )
  | { callWasSuccessful: false; error: Error };
