/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { Route, routeInjectionToken } from "../../../../route-injection-token";

export interface HelmChartsPathParameters {
  repo?: string;
  chartName?: string;
}

const helmChartsRouteInjectable = getInjectable({
  id: "helm-charts-route",

  instantiate: (): Route<HelmChartsPathParameters> => ({
    path: "/helm/charts/:repo?/:chartName?",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

  injectionToken: routeInjectionToken,
});

export default helmChartsRouteInjectable;
