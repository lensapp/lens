/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import clustersThatAreBeingDeletedInjectable from "../../../../main/cluster/are-being-deleted.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { setClusterAsDeletingChannel } from "../common/set-as-deleting-channel";

const setClusterAsDeletingChannelHandlerInjectable = getRequestChannelListenerInjectable({
  id: "set-cluster-as-deleting-channel-handler",
  channel: setClusterAsDeletingChannel,
  getHandler: (di) => {
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);

    return (clusterId) => {
      clustersThatAreBeingDeleted.add(clusterId);
    };
  },
});

export default setClusterAsDeletingChannelHandlerInjectable;
