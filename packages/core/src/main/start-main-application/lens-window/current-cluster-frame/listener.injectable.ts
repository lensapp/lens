/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { currentClusterMessageChannel } from "../../../../common/cluster/current-cluster-channel";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import currentClusterFrameClusterIdStateInjectable from "./current-cluster-frame-cluster-id-state.injectable";

const currentVisibileClusterListenerInjectable = getMessageChannelListenerInjectable({
  id: "current-visibile-cluster",
  channel: currentClusterMessageChannel,
  handler: (di) => {
    const currentClusterFrameState = di.inject(currentClusterFrameClusterIdStateInjectable);

    return clusterId => currentClusterFrameState.set(clusterId);
  },
});

export default currentVisibileClusterListenerInjectable;
