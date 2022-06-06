/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "./request-channel-injection-token";

export type RequestChannelHandlerFunction<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (request: Request) => Response | Promise<Response>
  : never;

export interface RequestChannelHandler<Channel> {
  channel: Channel;
  handler: RequestChannelHandlerFunction<Channel>;
}

export const requestChannelHandlerInjectionToken = getInjectionToken<RequestChannelHandler<RequestChannel<any, any>>>(
  {
    id: "request-channel-handler",
  },
);

export function getRequestChannelHandlerInjectable<
  ChannelInjectionToken,
  Channel = ChannelInjectionToken extends Injectable<infer Channel, RequestChannel<any, any>, void>
    ? Channel
    : never,
>(
  channelInjectionToken: ChannelInjectionToken,
  instantiate: (di: DiContainerForInjection) => RequestChannelHandlerFunction<Channel>,
) {
  const token = channelInjectionToken as unknown as Injectable<RequestChannel<any, any>, RequestChannel<any, any>, void>;

  return getInjectable({
    id: `${token.id}-handler`,
    instantiate: (di) => ({
      channel: di.inject(token),
      handler: instantiate(di),
    }),
    injectionToken: requestChannelHandlerInjectionToken,
  });
}
