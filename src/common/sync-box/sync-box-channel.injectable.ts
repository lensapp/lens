/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

export type SyncBoxChannel = Channel<{ id: string; value: unknown }>;

const syncBoxChannelInjectable = getInjectable({
  id: "sync-box-channel",

  instantiate: (): SyncBoxChannel => ({
    id: "sync-box-channel",
  }),

  injectionToken: channelInjectionToken,
});

export default syncBoxChannelInjectable;
