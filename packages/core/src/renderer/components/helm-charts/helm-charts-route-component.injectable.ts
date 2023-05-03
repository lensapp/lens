/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { HelmCharts } from "./helm-charts";
import helmChartsRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/helm-charts-route.injectable";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";

const helmChartsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "helm-charts-route-component",
  Component: HelmCharts,
  routeInjectable: helmChartsRouteInjectable,
});

export default helmChartsRouteComponentInjectable;
