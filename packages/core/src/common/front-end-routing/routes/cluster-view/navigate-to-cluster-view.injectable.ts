/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../navigate-to-route-injection-token";
import clusterViewRouteInjectable from "./cluster-view-route.injectable";

export type NavigateToClusterView = (clusterId: string) => void;

const navigateToClusterViewInjectable = getInjectable({
  id: "navigate-to-cluster-view",

  instantiate: (di): NavigateToClusterView => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(clusterViewRouteInjectable);

    return (clusterId) =>
      navigateToRoute(route, { parameters: { clusterId }});
  },
});

export default navigateToClusterViewInjectable;
