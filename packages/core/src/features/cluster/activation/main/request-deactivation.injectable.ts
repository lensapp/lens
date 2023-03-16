/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitAppEventInjectable from "../../../../common/app-event-bus/emit-event.injectable";
import clusterFramesInjectable from "../../../../common/cluster-frames.injectable";
import clusterConnectionInjectable from "../../../../main/cluster/cluster-connection.injectable";
import getClusterByIdInjectable from "../../storage/common/get-by-id.injectable";
import { requestClusterDeactivationInjectionToken } from "../common/request-token";

const requestClusterDeactivationInjectable = getInjectable({
  id: "request-cluster-deactivation",
  instantiate: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const clusterFrames = di.inject(clusterFramesInjectable);
    const emitAppEvent = di.inject(emitAppEventInjectable);

    return async (clusterId) => {
      emitAppEvent({ name: "cluster", action: "stop" });

      const cluster = getClusterById(clusterId);

      if (!cluster) {
        return;
      }

      const connection = di.inject(clusterConnectionInjectable, cluster);

      connection.disconnect();
      clusterFrames.delete(clusterId);
    };
  },
  injectionToken: requestClusterDeactivationInjectionToken,
});

export default requestClusterDeactivationInjectable;
