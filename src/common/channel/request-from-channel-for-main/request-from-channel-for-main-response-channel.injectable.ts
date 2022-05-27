/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../message-channel-injection-token";
import { messageChannelInjectionToken } from "../message-channel-injection-token";

export type RequestFromChannelForMainResponseChannel = MessageChannel<{ channelId: string; response: any }>;

const requestFromChannelForMainResponseChannelInjectable = getInjectable({
  id: "request-from-channel-for-main-response-channel",

  instantiate: (): RequestFromChannelForMainResponseChannel => ({
    id: "request-from-channel-for-main-response-channel",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default requestFromChannelForMainResponseChannelInjectable;
