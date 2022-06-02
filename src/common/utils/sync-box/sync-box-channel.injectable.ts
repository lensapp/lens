/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../channel/message-channel-injection-token";

export type SyncBoxChannel = MessageChannel<{ id: string; value: any }>;

const syncBoxChannelInjectable = getInjectable({
  id: "sync-box-channel",

  instantiate: (): SyncBoxChannel => ({
    id: "sync-box-channel",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default syncBoxChannelInjectable;
