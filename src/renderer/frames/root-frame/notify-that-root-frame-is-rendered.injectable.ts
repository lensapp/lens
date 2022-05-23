/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendToChannelInjectionToken } from "../../../common/channel/send-to-channel-injection-token";
import rootFrameRenderedChannelInjectable from "../../../common/root-frame-rendered-channel/root-frame-rendered-channel.injectable";

const notifyThatRootFrameIsRenderedInjectable = getInjectable({
  id: "notify-that-root-frame-is-rendered",

  instantiate: (di) => {
    const sendToChannel = di.inject(sendToChannelInjectionToken);
    const rootFrameRenderedChannel = di.inject(rootFrameRenderedChannelInjectable);

    return () => {
      sendToChannel(rootFrameRenderedChannel);
    };
  },
});

export default notifyThatRootFrameIsRenderedInjectable;
