/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { currentClusterMessageChannel } from "../../../../common/cluster/current-cluster-channel";
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import currentClusterFrameClusterIdStateInjectable from "./current-cluster-frame-cluster-id-state.injectable";

const currentVisibleClusterListenerInjectable = getMessageChannelListenerInjectable({
  id: "current-visible-cluster",
  channel: currentClusterMessageChannel,
  getHandler: (di) => {
    const currentClusterFrameState = di.inject(currentClusterFrameClusterIdStateInjectable);

    return clusterId => currentClusterFrameState.set(clusterId);
  },
});

export default currentVisibleClusterListenerInjectable;
