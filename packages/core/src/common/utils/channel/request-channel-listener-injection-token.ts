/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface RequestChannel<Request, Response> {
  id: string;
  _requestSignature?: Request; // used only to mark `Request` as "used"
  _responseSignature?: Response; // used only to mark `Response` as "used"
}
