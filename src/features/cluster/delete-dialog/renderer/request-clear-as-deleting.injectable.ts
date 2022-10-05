/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import clearClusterAsDeletingChannelInjectable from "../common/clear-as-deleting-channel.injectable";

export type RequestClearClusterAsDeleting = (clusterId: ClusterId) => Promise<void>;

const requestClearClusterAsDeletingInjectable = getInjectable({
  id: "request-clear-cluster-as-deleting",
  instantiate: (di): RequestClearClusterAsDeleting => {
    const requestChannel = di.inject(requestFromChannelInjectable);
    const clearClusterAsDeletingChannel = di.inject(clearClusterAsDeletingChannelInjectable);

    return (clusterId) => requestChannel(clearClusterAsDeletingChannel, clusterId);
  },
});

export default requestClearClusterAsDeletingInjectable;
