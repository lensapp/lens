/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { rootFrameHasRenderedChannel } from "../../../common/root-frame/root-frame-rendered-channel";

const broadcastThatRootFrameIsRenderedInjectable = getInjectable({
  id: "broadcast-that-root-frame-is-rendered",

  instantiate: (di) => {
    const messageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return () => {
      messageToChannel(rootFrameHasRenderedChannel);
    };
  },
});

export default broadcastThatRootFrameIsRenderedInjectable;
