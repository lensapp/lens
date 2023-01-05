/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { initialClusterStatesChannel } from "../common/channels";

const handleInitialClusterStateSyncInjectable = getRequestChannelListenerInjectable({
  channel: initialClusterStatesChannel,
  handler: (di) => {
    const clusterStore = di.inject(clusterStoreInjectable);

    return () => clusterStore.clustersList.map(cluster => ({
      clusterId: cluster.id,
      state: cluster.getState(),
    }));
  },
});

export default handleInitialClusterStateSyncInjectable;
