/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection, Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { MessageChannel } from "./message-channel-injection-token";

export type MessageChannelListenerFunction<Channel> = Channel extends MessageChannel<infer Message>
  ? (message: Message) => void
  : never;

export interface MessageChannelListener<Channel> {
  channel: Channel;
  handler: MessageChannelListenerFunction<Channel>;
}

export const messageChannelListenerInjectionToken = getInjectionToken<MessageChannelListener<MessageChannel<any>>>(
  {
    id: "message-channel-listener",
  },
);

export function getMessageChannelListenerInjectable<
  ChannelInjectionToken,
  Channel = ChannelInjectionToken extends Injectable<infer Channel, MessageChannel<any>, void>
    ? Channel
    : never,
>(
  channelInjectionToken: ChannelInjectionToken,
  instantiate: (di: DiContainerForInjection) => MessageChannelListenerFunction<Channel>,
) {
  const token = channelInjectionToken as unknown as Injectable<MessageChannel<any>, MessageChannel<any>, void>;

  return getInjectable({
    id: `${token.id}-listener`,
    instantiate: (di) => ({
      channel: di.inject(token),
      handler: instantiate(di),
    }),
    injectionToken: messageChannelListenerInjectionToken,
  });
}
