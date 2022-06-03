/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IpcValue } from "./allowed-types";

export interface MessageChannel<Message extends IpcValue | void = void> {
  id: string;
  _messageSignature?: Message;
}

export const messageChannelInjectionToken = getInjectionToken<MessageChannel<any>>({
  id: "message-channel",
});
