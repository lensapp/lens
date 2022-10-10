/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import type { RequestChannel } from "../../../../common/utils/channel/request-channel-injection-token";
import { requestChannelInjectionToken } from "../../../../common/utils/channel/request-channel-injection-token";

export type DeleteClusterChannel = RequestChannel<ClusterId, void>;

const deleteClusterChannelInjectable = getInjectable({
  id: "delete-cluster-channel",
  instantiate: (): DeleteClusterChannel => ({
    id: "delete-cluster",
  }),
  injectionToken: requestChannelInjectionToken,
});

export default deleteClusterChannelInjectable;
