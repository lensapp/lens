/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { clusterStateSyncChannel } from "../common/channels";

const clusterStateListenerInjectable = getMessageChannelListenerInjectable({
  channel: clusterStateSyncChannel,
  id: "main",
  handler: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return ({ clusterId, state }) => getClusterById(clusterId)?.setState(state);
  },
});

export default clusterStateListenerInjectable;
