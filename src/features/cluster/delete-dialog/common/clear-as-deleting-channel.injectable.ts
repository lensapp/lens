/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../../../../common/utils/channel/request-channel-injection-token";

export type ClearClusterAsDeletingChannel = RequestChannel<ClusterId, void>;

const clearClusterAsDeletingChannelInjectable = getInjectable({
  id: "clear-cluster-as-deleting-channel",
  instantiate: (): ClearClusterAsDeletingChannel => ({
    id: "clear-cluster-as-deleting",
  }),
  injectionToken: requestChannelInjectionToken,
});

export default clearClusterAsDeletingChannelInjectable;
