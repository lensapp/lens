/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { networkGoneOnlineChannel } from "../common/channels";

const sendNetworkGoneOnlineInjectable = getInjectable({
  id: "send-network-gone-online",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return () => sendMessageToChannel(networkGoneOnlineChannel);
  },
});

export default sendNetworkGoneOnlineInjectable;
