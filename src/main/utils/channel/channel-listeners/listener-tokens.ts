/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-listener-injection-token";

export type RequestChannelHandler<Channel> = Channel extends RequestChannel<infer Request, infer Response>
  ? (req: Request) => Promise<Response> | Response
  : never;

export interface RequestChannelListener<Channel> {
  channel: Channel;
  handler: RequestChannelHandler<Channel>;
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
  handler: (di: DiContainerForInjection) => RequestChannelHandler<Channel>;
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
      handler: info.handler(di),
    }),
    injectionToken: requestChannelListenerInjectionToken,
  });
}
