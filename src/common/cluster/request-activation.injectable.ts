/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../cluster-types";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";

export interface ClusterActivationRequest {
  clusterId: ClusterId;
  force: boolean;
}
export type ClusterActivationRequestChannel = RequestChannel<ClusterActivationRequest, void>;

const clusterActivationRequestChannelInjectable = getInjectable({
  id: "cluster-activation-request-channel",
  instantiate: (): ClusterActivationRequestChannel => ({
    id: "cluster-request-activation",
  }),
});

export default clusterActivationRequestChannelInjectable;
