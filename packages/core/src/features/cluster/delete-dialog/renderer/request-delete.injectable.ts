/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { deleteClusterChannel } from "../common/delete-channel";

export type RequestDeleteCluster = (clusterId: ClusterId) => Promise<void>;

const requestDeleteClusterInjectable = getInjectable({
  id: "request-delete-cluster",
  instantiate: (di): RequestDeleteCluster => {
    const requestChannel = di.inject(requestFromChannelInjectionToken);

    return (clusterId) => requestChannel(deleteClusterChannel, clusterId);
  },
});

export default requestDeleteClusterInjectable;
