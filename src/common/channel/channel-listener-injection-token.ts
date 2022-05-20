/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel-injection-token";

export interface ChannelListener<TChannel extends Channel<any, any>> {
  channel: TChannel;
  handler: (value: TChannel["_messageTemplate"]) => TChannel["_returnTemplate"];
}

export const channelListenerInjectionToken = getInjectionToken<ChannelListener<Channel<any, any>>>(
  {
    id: "channel-listener",
  },
);
