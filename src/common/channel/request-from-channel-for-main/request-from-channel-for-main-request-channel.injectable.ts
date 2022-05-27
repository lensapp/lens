/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../message-channel-injection-token";
import { messageChannelInjectionToken } from "../message-channel-injection-token";

export type RequestFromChannelForMainRequestChannel = MessageChannel<{ channelId: string; request: any }>;

const requestFromChannelForMainRequestChannelInjectable = getInjectable({
  id: "request-from-channel-for-main-request-channel",

  instantiate: (): RequestFromChannelForMainRequestChannel => ({
    id: "request-from-channel-for-main-request-channel",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default requestFromChannelForMainRequestChannelInjectable;
