/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelSender } from "../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { windowLocationChangedChannel } from "../common/channel";

export type EmitWindowLocationChanged = MessageChannelSender<typeof windowLocationChangedChannel>;

const emitWindowLocationChangedInjectable = getInjectable({
  id: "emit-window-location-changed",
  instantiate: (di): EmitWindowLocationChanged => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return () => sendMessageToChannel(windowLocationChangedChannel);
  },
});

export default emitWindowLocationChangedInjectable;
