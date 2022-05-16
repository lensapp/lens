/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Channel } from "./channel";

export interface ChannelListener<TChannel extends Channel<unknown>> {
  channel: TChannel;
  handler: (value: TChannel["_template"]) => void;
}

export const channelListenerInjectionToken = getInjectionToken<ChannelListener<Channel<unknown>>>(
  {
    id: "channel-listener",
  },
);
