/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { SetVisibleClusterChannel } from "../../common/cluster/set-visible-channel.injectable";
import setVisibleClusterChannelInjectable from "../../common/cluster/set-visible-channel.injectable";
import type { EmitChannelMessage } from "../../common/utils/channel/message-to-channel-injection-token";
import messageToChannelInjectable from "../utils/channel/message-to-channel.injectable";

export type SendSetVisibleCluster = EmitChannelMessage<SetVisibleClusterChannel>;

const sendSetVisibleClusterInjectable = getInjectable({
  id: "send-set-visible-cluster",
  instantiate: (di): SendSetVisibleCluster => {
    const channel = di.inject(setVisibleClusterChannelInjectable);
    const messageToChannel = di.inject(messageToChannelInjectable);

    return (message) => messageToChannel(channel, message);
  },
});

export default sendSetVisibleClusterInjectable;
