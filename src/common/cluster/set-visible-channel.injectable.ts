/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../cluster-types";
import type { MessageChannel } from "../utils/channel/message-channel-injection-token";

export type SetVisibleClusterMessage = {
  action: "set";
  clusterId: ClusterId;
} | {
  action: "clear";
};

export type SetVisibleClusterChannel = MessageChannel<SetVisibleClusterMessage>;

const setVisibleClusterChannelInjectable = getInjectable({
  id: "set-visible-cluster-channel",
  instantiate: (): SetVisibleClusterChannel => ({
    id: "set-visible-cluster-channel",
  }),
});

export default setVisibleClusterChannelInjectable;
