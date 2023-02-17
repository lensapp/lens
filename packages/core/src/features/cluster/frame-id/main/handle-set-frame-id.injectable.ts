/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import pushCatalogToRendererInjectable from "../../../../main/catalog-sync-to-renderer/push-catalog-to-renderer.injectable";
import { getRawRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { setClusterFrameIdChannel } from "../common/channel";

const handleSetClusterFrameIdInjectable = getRawRequestChannelListenerInjectable({
  channel: setClusterFrameIdChannel,
  handler: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const clusterFrames = di.inject(clusterFramesInjectable);
    const pushCatalogToRenderer = di.inject(pushCatalogToRendererInjectable);

    return (event, clusterId) => {
      const cluster = getClusterById(clusterId);

      if (cluster) {
        clusterFrames.set(cluster.id, { frameId: event.frameId, processId: event.processId });
        pushCatalogToRenderer();
      }
    };
  },
});

export default handleSetClusterFrameIdInjectable;
