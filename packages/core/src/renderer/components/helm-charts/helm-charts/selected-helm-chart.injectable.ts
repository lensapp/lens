/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmChartsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/helm/charts/helm-charts-route.injectable";
import routePathParametersInjectable from "../../../routes/route-path-parameters.injectable";
import helmChartsInjectable from "./helm-charts.injectable";

const selectedHelmChartInjectable = getInjectable({
  id: "selected-helm-chart",

  instantiate: (di) => {
    const route = di.inject(helmChartsRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);
    const helmCharts = di.inject(helmChartsInjectable);

    return computed(() => {
      const { chartName, repo } = pathParameters.get() ?? {};

      if (!chartName || !repo) {
        return undefined;
      }

      return helmCharts.value
        .get()
        .find((chart) => (
          chart.getName() === chartName
          && chart.getRepository() === repo
        ));
    });
  },
});

export default selectedHelmChartInjectable;
