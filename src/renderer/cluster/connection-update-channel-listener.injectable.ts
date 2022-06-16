/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterConnectionStatusStateInjectable from "../components/cluster-manager/cluster-status.state.injectable";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";
import type { ClusterConnectionUpdateChannel } from "../../common/cluster/connection-update-channel.injectable";
import clusterConnectionUpdateChannelInjectable from "../../common/cluster/connection-update-channel.injectable";

const clusterConnectionChannelListenerInjectable = getInjectable({
  id: "cluster-connection-channel-listener",
  instantiate: (di): MessageChannelListener<ClusterConnectionUpdateChannel> => {
    const clusterConnectionUpdateChannel = di.inject(clusterConnectionUpdateChannelInjectable);
    const state = di.inject(clusterConnectionStatusStateInjectable);

    return {
      channel: clusterConnectionUpdateChannel,
      handler: ({ clusterId, update }) => {
        const status = state.forCluster(clusterId);

        status.appendAuthUpdate(update);
      },
    };
  },
  injectionToken: messageChannelListenerInjectionToken,
});

export default clusterConnectionChannelListenerInjectable;
