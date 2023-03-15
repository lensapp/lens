/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import requestFromChannelInjectable from "../../../../renderer/utils/channel/request-from-channel.injectable";
import { deactivateClusterChannel } from "../common/channels";
import { requestClusterDeactivationInjectionToken } from "../common/request-token";

const requestClusterDeactivationInjectable = getInjectable({
  id: "request-cluster-deactivation",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return (clusterId) => requestFromChannel(deactivateClusterChannel, clusterId);
  },
  injectionToken: requestClusterDeactivationInjectionToken,
});

export default requestClusterDeactivationInjectable;
