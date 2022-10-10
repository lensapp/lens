/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/cluster-types";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import deleteClusterChannelInjectable from "../common/delete-channel.injectable";

export type RequestDeleteCluster = (clusterId: ClusterId) => Promise<void>;

const requestDeleteClusterInjectable = getInjectable({
  id: "request-delete-cluster",
  instantiate: (di): RequestDeleteCluster => {
    const requestChannel = di.inject(requestFromChannelInjectable);
    const deleteClusterChannel = di.inject(deleteClusterChannelInjectable);

    return (clusterId) => requestChannel(deleteClusterChannel, clusterId);
  },
});

export default requestDeleteClusterInjectable;
