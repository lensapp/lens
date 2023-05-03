/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import helmChartsRouteInjectable from "./helm-charts-route.injectable";
import type { NavigateToSpecificRoute } from "../../../../navigate-to-route-injection-token";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

export type NavigateToHelmCharts = NavigateToSpecificRoute<typeof helmChartsRouteInjectable>;

const navigateToHelmChartsInjectable = getInjectable({
  id: "navigate-to-helm-charts",

  instantiate: (di): NavigateToHelmCharts => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(helmChartsRouteInjectable);

    return (parameters) => navigateToRoute(route, { parameters });
  },
});

export default navigateToHelmChartsInjectable;
