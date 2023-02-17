/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import prefixedLoggerInjectable from "../../../common/logger/prefixed-logger.injectable";
import requestSetClusterFrameIdInjectable from "../../../features/cluster/frame-id/renderer/request-set-frame-id.injectable";
import frameRoutingIdInjectable from "../../../features/electron/renderer/frame-routing-id.injectable";
import { beforeClusterFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import clusterFrameClusterInjectable from "../../cluster-frame-context/cluster-frame-cluster.injectable";

const waitForClusterToFinishActivatingInjectable = getInjectable({
  id: "wait-for-cluster-to-finish-activating",
  instantiate: (di) => ({
    id: "wait-for-cluster-to-finish-activating",
    run: async () => {
      const cluster = di.inject(clusterFrameClusterInjectable);
      const requestSetClusterFrameId = di.inject(requestSetClusterFrameIdInjectable);
      const logger = di.inject(prefixedLoggerInjectable, "CLUSTER-FRAME");
      const frameRoutingId = di.inject(frameRoutingIdInjectable);

      logger.info(`Init dashboard, clusterId=${cluster.id}, frameId=${frameRoutingId}`);

      await requestSetClusterFrameId(cluster.id);
      await when(() => cluster.ready); // cluster.activate() is done at this point
    },
  }),
  injectionToken: beforeClusterFrameStartsSecondInjectionToken,
});

export default waitForClusterToFinishActivatingInjectable;
