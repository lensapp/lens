/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";
import type { Route } from "../../front-end-route-injection-token";

export interface ClusterViewRouteParams {
  clusterId: string;
}

const clusterViewRouteInjectable = getInjectable({
  id: "cluster-view-route",

  instantiate: () => ({
    path: "/cluster/:clusterId" as const,
    clusterFrame: false,
    isEnabled: computed(() => true),
  }) as Route<ClusterViewRouteParams>,

  injectionToken: frontEndRouteInjectionToken,
});

export default clusterViewRouteInjectable;
