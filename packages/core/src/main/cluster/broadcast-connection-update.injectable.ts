/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubeAuthUpdate } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export type BroadcastConnectionUpdate = (update: KubeAuthUpdate) => void;

const broadcastConnectionUpdateInjectable = getInjectable({
  id: "broadcast-connection-update",
  instantiate: (di, cluster): BroadcastConnectionUpdate => {
    const broadcastMessage = di.inject(broadcastMessageInjectable);
    const logger = di.inject(loggerInjectionToken);

    return (update) => {
      logger.debug(`[CLUSTER]: broadcasting connection update`, { ...update, meta: cluster.getMeta() });
      broadcastMessage(`cluster:${cluster.id}:connection-update`, update);
    };
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default broadcastConnectionUpdateInjectable;
