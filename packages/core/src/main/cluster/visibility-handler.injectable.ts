/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { clusterVisibilityChannel } from "../../common/cluster/visibility-channel";
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import visibleClusterInjectable from "./visible-cluster.injectable";

const clusterVisibilityHandlerInjectable = getMessageChannelListenerInjectable({
  channel: clusterVisibilityChannel,
  id: "base",
  getHandler: (di) => {
    const visibleCluster = di.inject(visibleClusterInjectable);

    return (clusterId) => visibleCluster.set(clusterId);
  },
});

export default clusterVisibilityHandlerInjectable;
