/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelSender } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { clusterFailedToListNamespacesChannel } from "../common/channel";

export type EmitClusterFailedToListNamespaces = MessageChannelSender<typeof clusterFailedToListNamespacesChannel>;

const emitClusterFailedToListNamespacesInjectable = getInjectable({
  id: "emit-cluster-failed-to-list-namespaces",
  instantiate: (di): EmitClusterFailedToListNamespaces => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (clusterId) => sendMessageToChannel(clusterFailedToListNamespacesChannel, clusterId);
  },
});

export default emitClusterFailedToListNamespacesInjectable;
