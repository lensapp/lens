/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { clusterStateSyncChannel } from "../common/channels";

const clusterStateListenerInjectable = getMessageChannelListenerInjectable({
  channel: clusterStateSyncChannel,
  id: "main",
  getHandler: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return ({ clusterId, state }) => getClusterById(clusterId)?.setState(state);
  },
});

export default clusterStateListenerInjectable;
