/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

export interface MessageChannel<Message> {
  id: string;
  _messageSignature?: Message; // only used to mark `Message` as used
}

export type MessageChannelHandler<Channel> = Channel extends MessageChannel<infer Message>
  ? (message: Message) => void
  : never;

export interface MessageChannelListener<Channel> {
  channel: Channel;
  handler: MessageChannelHandler<Channel>;
}

export const messageChannelListenerInjectionToken = getInjectionToken<MessageChannelListener<MessageChannel<unknown>>>(
  {
    id: "message-channel-listener",
  },
);

export interface GetMessageChannelListenerInfo<
  Channel extends MessageChannel<Message>,
  Message,
> {
  channel: Channel;
  handlerInjectable: Injectable<MessageChannelHandler<Channel>, unknown, void>;
}

export function getMessageChannelListenerInjectable<
  Channel extends MessageChannel<Message>,
  Message,
>(info: GetMessageChannelListenerInfo<Channel, Message>) {
  return getInjectable({
    id: `${info.channel.id}-listener`,
    instantiate: (di) => ({
      channel: info.channel,
      handler: di.inject(info.handlerInjectable),
    }),
    injectionToken: messageChannelListenerInjectionToken,
  });
}
