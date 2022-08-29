/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

export type RequestChannelHandler<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (req: Request) => Promise<Response> | Response
  : never;

export interface RequestChannelListener<Channel> {
  channel: Channel;
  handler: RequestChannelHandler<Channel>;
}

export interface RequestChannel<Request, Response> {
  id: string;
  _requestSignature?: Request; // used only to mark `Request` as "used"
  _responseSignature?: Response; // used only to mark `Response` as "used"
}

export const requestChannelListenerInjectionToken = getInjectionToken<RequestChannelListener<RequestChannel<unknown, unknown>>>( {
  id: "request-channel-listener",
});

export interface GetRequestChannelListenerInjectableInfo<
  Channel extends RequestChannel<Request, Response>,
  Request,
  Response,
> {
  channel: Channel;
  handlerInjectable: Injectable<RequestChannelHandler<Channel>, unknown, void>;
}

export function getRequestChannelListenerInjectable<
  Channel extends RequestChannel<Request, Response>,
  Request,
  Response,
>(info: GetRequestChannelListenerInjectableInfo<Channel, Request, Response>) {
  return getInjectable({
    id: `${info.channel.id}-listener`,
    instantiate: (di) => ({
      channel: info.channel,
      handler: di.inject(info.handlerInjectable),
    }),
    injectionToken: requestChannelListenerInjectionToken,
  });
}
