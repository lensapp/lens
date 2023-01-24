/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import { clusterVisibilityChannel } from "../../../common/cluster/visibility-channel";

export type EmitClusterVisibility = MessageChannelHandler<typeof clusterVisibilityChannel>;

const emitClusterVisibilityInjectable = getInjectable({
  id: "emit-cluster-visibility",
  instantiate: (di): EmitClusterVisibility => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (id) => sendMessageToChannel(clusterVisibilityChannel, id);
  },
});

export default emitClusterVisibilityInjectable;
