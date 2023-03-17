/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import type { ClusterStateSync } from "../common/channels";
import { clusterStateSyncChannel } from "../common/channels";

const emitClusterStateUpdateInjectable = getInjectable({
  id: "emit-cluster-state-update",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (message: ClusterStateSync) => sendMessageToChannel(clusterStateSyncChannel, message);
  },
});

export default emitClusterStateUpdateInjectable;
