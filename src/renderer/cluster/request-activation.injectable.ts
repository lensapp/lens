/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterActivationRequestChannel } from "../../common/cluster/request-activation.injectable";
import clusterActivationRequestChannelInjectable from "../../common/cluster/request-activation.injectable";
import type { RequestFromChannelImpl } from "../../common/utils/channel/request-from-channel-injection-token";
import requestFromChannelInjectable from "../utils/channel/request-from-channel.injectable";

export type RequestClusterActivation = RequestFromChannelImpl<ClusterActivationRequestChannel>;

const requestClusterActivationInjectable = getInjectable({
  id: "request-cluster-activation",
  instantiate: (di): RequestClusterActivation => {
    const channel = di.inject(clusterActivationRequestChannelInjectable);
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return (clusterId) => requestFromChannel(channel, clusterId);
  },
});

export default requestClusterActivationInjectable;
