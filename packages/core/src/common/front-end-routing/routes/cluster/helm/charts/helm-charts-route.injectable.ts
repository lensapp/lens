/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../../front-end-route-injection-token";

const helmChartsRouteInjectable = getFrontEndRouteInjectable({
  id: "helm-charts-route",
  path: "/helm/charts/:repo?/:chartName?",
  clusterFrame: true,
});

export default helmChartsRouteInjectable;
