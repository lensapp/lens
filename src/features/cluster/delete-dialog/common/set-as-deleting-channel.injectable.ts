/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../../../../common/utils/channel/request-channel-injection-token";

export type SetClusterAsDeletingChannel = RequestChannel<ClusterId, void>;

const setClusterAsDeletingChannelInjectable = getInjectable({
  id: "set-cluster-as-deleting-channel",
  instantiate: (): SetClusterAsDeletingChannel => ({
    id: "set-cluster-as-deleting",
  }),
  injectionToken: requestChannelInjectionToken,
});

export default setClusterAsDeletingChannelInjectable;
