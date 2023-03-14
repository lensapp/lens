/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { initialClusterStatesChannel } from "../common/channels";

const handleInitialClusterStateSyncInjectable = getRequestChannelListenerInjectable({
  id: 'handle-initial-cluster-state-sync',
  channel: initialClusterStatesChannel,
  getHandler: (di) => {
    const clusterStore = di.inject(clusterStoreInjectable);

    return () => clusterStore.clustersList.map(cluster => ({
      clusterId: cluster.id,
      state: cluster.getState(),
    }));
  },
});

export default handleInitialClusterStateSyncInjectable;
