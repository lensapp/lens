/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import clustersThatAreBeingDeletedInjectable from "../../../../main/cluster/are-being-deleted.injectable";
import setClusterAsDeletingChannelInjectable from "../common/set-as-deleting-channel.injectable";

const setClusterAsDeletingChannelHandlerInjectable = getInjectable({
  id: "set-cluster-as-deleting-channel-handler",
  instantiate: (di) => {
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);

    return {
      channel: di.inject(setClusterAsDeletingChannelInjectable),
      handler: (clusterId) => clustersThatAreBeingDeleted.add(clusterId),
    };
  },
  injectionToken: requestChannelListenerInjectionToken,
});

export default setClusterAsDeletingChannelHandlerInjectable;
