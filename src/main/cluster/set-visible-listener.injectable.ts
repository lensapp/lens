/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SetVisibleClusterChannel } from "../../common/cluster/set-visible-channel.injectable";
import setVisibleClusterChannelInjectable from "../../common/cluster/set-visible-channel.injectable";
import { messageChannelListenerInjectionToken } from "../../common/utils/channel/message-channel-listener-injection-token";
import type { MessageChannelListener } from "../../common/utils/channel/message-channel-listener-injection-token";
import clusterManagerInjectable from "../cluster-manager.injectable";

const setVisibileClusterListenerInjectable = getInjectable({
  id: "set-visible-cluster-listener",
  instantiate: (di) => {
    const channel = di.inject(setVisibleClusterChannelInjectable);
    const clusterManager = di.inject(clusterManagerInjectable);

    return {
      channel,
      handler: (message) => {
        switch (message.action) {
          case "clear":
            clusterManager.visibleCluster = undefined;
            break;
          case "set":
            clusterManager.visibleCluster = message.clusterId;
            break;
        }
      },
    } as MessageChannelListener<SetVisibleClusterChannel>;
  },
  injectionToken: messageChannelListenerInjectionToken,
});

export default setVisibileClusterListenerInjectable;

