/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { MessageChannel } from "./message-channel-injection-token";

export type EmitChannelMessage<Channel> = Channel extends MessageChannel<infer Message>
  ? (message: Message) => void
  : never;

export interface MessageToChannel {
  <TChannel extends MessageChannel<TMessage>, TMessage extends void>(
    channel: TChannel,
  ): void;

  <TChannel extends MessageChannel<any>>(
    channel: TChannel,
    message: SetRequired<TChannel, "_messageSignature">["_messageSignature"],
  ): void;
}

export const messageToChannelInjectionToken =
  getInjectionToken<MessageToChannel>({
    id: "message-to-message-channel",
  });
