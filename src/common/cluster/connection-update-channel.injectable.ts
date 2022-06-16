/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId, KubeAuthUpdate } from "../cluster-types";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";
import { messageChannelInjectionToken } from "../utils/channel/message-channel-injection-token";
import { getInjectable } from "@ogre-tools/injectable";

export interface ClusterConnectionUpdateMessage {
  clusterId: ClusterId;
  update: KubeAuthUpdate;
}

export type ClusterConnectionUpdateChannel = MessageChannel<ClusterConnectionUpdateMessage>;

const clusterConnectionUpdateChannelInjectable = getInjectable({
  id: "cluster-connection-update-channel",
  instantiate: (): ClusterConnectionUpdateChannel => ({
    id: "cluster:connection-update",
  }),
  injectionToken: messageChannelInjectionToken,
});

export default clusterConnectionUpdateChannelInjectable;
