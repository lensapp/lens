/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { clusterStateSyncChannel } from "../common/channels";

export type EmitClusterStateUpdate = MessageChannelHandler<typeof clusterStateSyncChannel>;

const emitClusterStateUpdateInjectable = getInjectable({
  id: "emit-cluster-state-update",
  instantiate: (di): EmitClusterStateUpdate => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (message) => sendMessageToChannel(clusterStateSyncChannel, message);
  },
});

export default emitClusterStateUpdateInjectable;
