/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export interface ChannelListener {
  channel: any;
  handler: (value: any) => void;
}

export const channelListenerInjectionToken = getInjectionToken<ChannelListener>(
  {
    id: "channel-listener",
  },
);
