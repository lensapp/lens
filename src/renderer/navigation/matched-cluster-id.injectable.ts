/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterViewRouteParametersInjectable from "../components/cluster-manager/cluster-view-route-parameters.injectable";

const matchedClusterIdInjectable = getInjectable({
  id: "matched-cluster-id",

  instantiate: (di) => {
    const routeParameters = di.inject(clusterViewRouteParametersInjectable);

    return routeParameters.clusterId;
  },
});

export default matchedClusterIdInjectable;
