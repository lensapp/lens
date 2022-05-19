/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel-injection-token";

export interface ChannelListener<TChannel extends Channel<any>> {
  channel: TChannel;
  handler: (value: TChannel["_messageTemplate"]) => void;
}

export const channelListenerInjectionToken = getInjectionToken<ChannelListener<Channel<any>>>(
  {
    id: "channel-listener",
  },
);
