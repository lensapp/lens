/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../front-end-route-injection-token";

const clusterOverviewRouteInjectable = getInjectable({
  id: "cluster-overview-route",

  instantiate: (di) => ({
    path: "/overview",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "nodes",
      group: "",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default clusterOverviewRouteInjectable;
