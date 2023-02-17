/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { networkGoneOfflineChannel } from "../common/channels";

const sendNetworkGoneOfflineInjectable = getInjectable({
  id: "send-network-gone-offline",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return () => sendMessageToChannel(networkGoneOfflineChannel);
  },
});

export default sendNetworkGoneOfflineInjectable;
