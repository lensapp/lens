/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";

export type RootFrameRenderedChannel = MessageChannel;

const rootFrameRenderedChannelInjectable = getInjectable({
  id: "root-frame-rendered-channel",

  instantiate: (): RootFrameRenderedChannel => ({
    id: "root-frame-rendered",
  }),

  injectionToken: messageChannelInjectionToken,
});

export default rootFrameRenderedChannelInjectable;
