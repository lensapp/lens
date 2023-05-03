/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clusterViewRouteInjectable from "../../common/front-end-routing/routes/cluster-view/cluster-view-route.injectable";
import routePathParametersInjectable from "../routes/route-path-parameters.injectable";

const matchedClusterIdInjectable = getInjectable({
  id: "matched-cluster-id",

  instantiate: (di) => {
    const route = di.inject(clusterViewRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return computed(() => pathParameters.get()?.clusterId);
  },
});

export default matchedClusterIdInjectable;
