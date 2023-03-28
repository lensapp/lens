/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import clustersInjectable from "../../storage/common/clusters.injectable";
import { initialClusterStatesChannel } from "../common/channels";

const handleInitialClusterStateSyncInjectable = getRequestChannelListenerInjectable({
  id: "handle-initial-cluster-state-sync",
  channel: initialClusterStatesChannel,
  getHandler: (di) => {
    const clusters = di.inject(clustersInjectable);

    return () => clusters.get().map(cluster => ({
      clusterId: cluster.id,
      state: cluster.getState(),
    }));
  },
});

export default handleInitialClusterStateSyncInjectable;
