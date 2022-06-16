/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../common/cluster-store/cluster-store.injectable";
import type { ClusterActivationRequestChannel } from "../../common/cluster/request-activation.injectable";
import clusterActivationRequestChannelInjectable from "../../common/cluster/request-activation.injectable";
import type { RequestChannelListener } from "../../common/utils/channel/request-channel-listener-injection-token";
import { requestChannelListenerInjectionToken } from "../../common/utils/channel/request-channel-listener-injection-token";

const requestClusterActivationHandlerInjectable = getInjectable({
  id: "request-cluster-activation-handler",
  instantiate: (di) => {
    const channel = di.inject(clusterActivationRequestChannelInjectable);
    const store = di.inject(clusterStoreInjectable);

    return {
      channel,
      handler: ({ clusterId, force }) => {
        store.getById(clusterId)?.activate(force);
      },
    } as RequestChannelListener<ClusterActivationRequestChannel>;
  },
  injectionToken: requestChannelListenerInjectionToken,
});

export default requestClusterActivationHandlerInjectable;
