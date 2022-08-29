/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestChannelHandler } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import clustersThatAreBeingDeletedInjectable from "../../../../main/cluster/are-being-deleted.injectable";
import type { SetClusterAsDeletingChannel } from "../common/set-as-deleting-channel";

const setClusterAsDeletingHandlerInjectable = getInjectable({
  id: "set-cluster-as-deleting-handler",
  instantiate: (di): RequestChannelHandler<SetClusterAsDeletingChannel> => {
    const clustersThatAreBeingDeleted = di.inject(clustersThatAreBeingDeletedInjectable);

    return (clusterId) => {
      clustersThatAreBeingDeleted.add(clusterId);
    };
  },
});

export default setClusterAsDeletingHandlerInjectable;
