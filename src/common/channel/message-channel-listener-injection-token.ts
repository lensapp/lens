/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { MessageChannel } from "./message-channel-injection-token";

export interface MessageChannelListener<TChannel extends MessageChannel<any>> {
  channel: TChannel;
  handler: (value: SetRequired<TChannel, "_messageSignature">["_messageSignature"]) => void;
}

export const messageChannelListenerInjectionToken = getInjectionToken<MessageChannelListener<MessageChannel<any>>>(
  {
    id: "message-channel-listener",
  },
);
