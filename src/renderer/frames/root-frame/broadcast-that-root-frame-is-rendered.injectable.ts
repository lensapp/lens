/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { messageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import rootFrameIsRenderedChannelInjectable from "../../../common/root-frame-rendered-channel/root-frame-rendered-channel.injectable";

const broadcastThatRootFrameIsRenderedInjectable = getInjectable({
  id: "broadcast-that-root-frame-is-rendered",

  instantiate: (di) => {
    const messageToChannel = di.inject(messageToChannelInjectionToken);
    const rootFrameIsRenderedChannel = di.inject(rootFrameIsRenderedChannelInjectable);

    return () => {
      messageToChannel(rootFrameIsRenderedChannel);
    };
  },
});

export default broadcastThatRootFrameIsRenderedInjectable;
