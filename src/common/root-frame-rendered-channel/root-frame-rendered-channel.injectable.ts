/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Channel } from "../channel/channel-injection-token";
import { channelInjectionToken } from "../channel/channel-injection-token";

export type RootFrameRenderedChannel = Channel<void>;

const rootFrameRenderedChannelInjectable = getInjectable({
  id: "root-frame-rendered-channel",

  instantiate: (): RootFrameRenderedChannel => ({
    id: "root-frame-rendered",
  }),

  injectionToken: channelInjectionToken,
});

export default rootFrameRenderedChannelInjectable;
