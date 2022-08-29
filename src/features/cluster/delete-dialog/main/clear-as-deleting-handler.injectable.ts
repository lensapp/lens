/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannelHandler } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import clustersThatAreBeingDeletedInjectable from "../../../../main/cluster/are-being-deleted.injectable";
import type { ClearClusterAsDeletingChannel } from "../common/clear-as-deleting-channel";

const clearClusterAsDeletingHandlerInjectable = getInjectable({
  id: "clear-cluster-as-deleting-handler",
  instantiate: (di): RequestChannelHandler<ClearClusterAsDeletingChannel> => {
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);

    return (clusterId) => {
      clustersThatAreBeingDeleted.delete(clusterId);
    };
  },
});

export default clearClusterAsDeletingHandlerInjectable;
