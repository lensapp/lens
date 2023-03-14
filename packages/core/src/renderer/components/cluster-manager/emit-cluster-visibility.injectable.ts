/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import { clusterVisibilityChannel } from "../../../common/cluster/visibility-channel";
import type { ClusterId } from "../../../common/cluster-types";

const emitClusterVisibilityInjectable = getInjectable({
  id: "emit-cluster-visibility",
  instantiate: (di) => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (id: ClusterId | null) => sendMessageToChannel(clusterVisibilityChannel, id);
  },
});

export default emitClusterVisibilityInjectable;
