/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface RequestChannel<Request, Response> {
  id: string;
  _requestSignature?: Request; // used only to mark `Request` as "used"
  _responseSignature?: Response; // used only to mark `Response` as "used"
}

export type ChannelRequest<Channel> = Channel extends RequestChannel<infer Request, any>
  ? Request
  : never;

export type ChannelResponse<Channel> = Channel extends RequestChannel<any, infer Response>
  ? Response
  : never;
