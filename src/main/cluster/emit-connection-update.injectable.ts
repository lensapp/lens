/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterConnectionUpdateChannel } from "../../common/cluster/connection-update-channel.injectable";
import clusterConnectionUpdateChannelInjectable from "../../common/cluster/connection-update-channel.injectable";
import type { EmitChannelMessage } from "../../common/utils/channel/message-to-channel-injection-token";
import messageToChannelInjectable from "../utils/channel/message-to-channel.injectable";

export type EmitClusterConnectionUpdate = EmitChannelMessage<ClusterConnectionUpdateChannel>;

const emitClusterConnectionUpdateInjectable = getInjectable({
  id: "emit-cluster-connection-update",
  instantiate: (di): EmitClusterConnectionUpdate => {
    const channel = di.inject(clusterConnectionUpdateChannelInjectable);
    const messageToChannel = di.inject(messageToChannelInjectable);

    return (message) => messageToChannel(channel, message);
  },
});

export default emitClusterConnectionUpdateInjectable;
