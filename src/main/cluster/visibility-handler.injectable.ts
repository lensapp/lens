/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { clusterVisibilityChannel } from "../../common/cluster/visibility-channel";
import { getMessageChannelListenerInjectable } from "../../common/utils/channel/message-channel-listener-injection-token";
import visibleClusterInjectable from "./visible-cluster.injectable";

const clusterVisibilityHandlerInjectable = getMessageChannelListenerInjectable({
  channel: clusterVisibilityChannel,
  id: "base",
  handler: (di) => {
    const visibleCluster = di.inject(visibleClusterInjectable);

    return (clusterId) => visibleCluster.set(clusterId);
  },
});

export default clusterVisibilityHandlerInjectable;
