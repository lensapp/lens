/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import clusterStoreInjectable from "../../../common/cluster-store/cluster-store.injectable";
import { getMessageChannelListenerInjectable } from "../../../common/utils/channel/message-channel-listener-injection-token";
import clusterManagerLoggerInjectable from "../../cluster/manager/common/logger.injectable";
import { networkGoneOfflineChannel } from "../common/channels";

const networkGoneOfflineListenerInjectable = getMessageChannelListenerInjectable({
  channel: networkGoneOfflineChannel,
  id: "main",
  handler: (di) => {
    const logger = di.inject(clusterManagerLoggerInjectable);
    const store = di.inject(clusterStoreInjectable);

    return () => {
      logger.info("network is online");

      for (const cluster of store.clusters.values()) {
        if (!cluster.disconnected) {
          cluster.online = false;
          cluster.accessible = false;
          void cluster.refreshConnectionStatus();
        }
      }
    };
  },
});

export default networkGoneOfflineListenerInjectable;
