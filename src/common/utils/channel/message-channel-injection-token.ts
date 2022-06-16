/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export interface MessageChannel<Message = void> {
  id: string;
  _messageSignature?: Message;
}

export const messageChannelInjectionToken = getInjectionToken<MessageChannel<any>>({
  id: "message-channel",
});
