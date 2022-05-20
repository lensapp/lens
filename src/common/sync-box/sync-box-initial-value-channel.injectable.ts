/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

export type SyncBoxInitialValueChannel = Channel<never, { id: string; value: unknown }[]>;

const syncBoxInitialValueChannelInjectable = getInjectable({
  id: "sync-box-initial-value-channel",

  instantiate: (): SyncBoxInitialValueChannel => ({
    id: "sync-box-initial-value-channel",
  }),

  injectionToken: channelInjectionToken,
});

export default syncBoxInitialValueChannelInjectable;
