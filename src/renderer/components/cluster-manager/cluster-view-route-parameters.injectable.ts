/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import clusterViewRouteInjectable from "../../../common/front-end-routing/routes/cluster-view/cluster-view-route.injectable";

const clusterViewRouteParametersInjectable = getInjectable({
  id: "cluster-view-route-parameters",

  instantiate: (di) => {
    const route = di.inject(clusterViewRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      clusterId: computed(() => pathParameters.get().clusterId),
    };
  },
});

export default clusterViewRouteParametersInjectable;
