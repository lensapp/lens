/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterConnectionInjectable from "../../../../main/cluster/cluster-connection.injectable";
import getClusterByIdInjectable from "../../storage/common/get-by-id.injectable";
import { requestClusterActivationInjectionToken } from "../common/request-token";

const requestClusterActivationInjectable = getInjectable({
  id: "request-cluster-activation",
  instantiate: (di) => {
    const getClusterById = di.inject(getClusterByIdInjectable);

    return async ({ clusterId, force = false }) => {
      const cluster = getClusterById(clusterId);

      if (!cluster) {
        return;
      }

      const connection = di.inject(clusterConnectionInjectable, cluster);

      await connection.activate(force);
    };
  },
  injectionToken: requestClusterActivationInjectionToken,
});

export default requestClusterActivationInjectable;
