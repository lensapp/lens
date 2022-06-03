/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { SetRequired } from "type-fest";
import type { IpcValue } from "./allowed-types";
import type { MessageChannel } from "./message-channel-injection-token";

export interface MessageToChannel {
  <Channel extends MessageChannel<void>>(channel: Channel): void;
  <
    Channel extends MessageChannel<IpcValue>,
    Message = SetRequired<Channel, "_messageSignature">["_messageSignature"],
  >(channel: Channel, message: Message): void;
}
export const messageToChannelInjectionToken = getInjectionToken<MessageToChannel>({
  id: "message-to-message-channel",
});
