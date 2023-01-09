/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubeAuthUpdate } from "../cluster-types";
import broadcastMessageInjectable from "../ipc/broadcast-message.injectable";

export type SendClusterConnectUpdate = (update: KubeAuthUpdate) => void;

const sendClusterConnectUpdateInjectable = getInjectable({
  id: "send-cluster-connect-update",
  instantiate: (di, clusterId): SendClusterConnectUpdate => {
    const broadcastMessage = di.inject(broadcastMessageInjectable);

    return (update) => broadcastMessage(`cluster:${clusterId}:connection-update`, update);
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, clusterId: string) => clusterId,
  }),
});

export default sendClusterConnectUpdateInjectable;
