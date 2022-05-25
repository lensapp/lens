/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { MessageChannel } from "./message-channel-injection-token";

export interface MessageToChannel {
  <TChannel extends MessageChannel<TMessage>, TMessage extends void>(
    channel: TChannel,
  ): void;

  <TChannel extends MessageChannel<TMessage>, TMessage>(
    channel: TChannel,
    message: TMessage
  ): void;
}

export const messageToChannelInjectionToken =
  getInjectionToken<MessageToChannel>({
    id: "message-to-message-channel",
  });
