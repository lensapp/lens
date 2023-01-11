/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmChartsRouteParametersInjectable from "../helm-charts-route-parameters.injectable";
import helmChartsInjectable from "./helm-charts.injectable";

const selectedHelmChartInjectable = getInjectable({
  id: "selected-helm-chart",

  instantiate: (di) => {
    const { chartName, repo } = di.inject(helmChartsRouteParametersInjectable);
    const helmCharts = di.inject(helmChartsInjectable);

    return computed(() => {
      const dereferencedChartName = chartName.get();
      const deferencedRepository = repo.get();

      if (!dereferencedChartName || !deferencedRepository) {
        return undefined;
      }

      return helmCharts.value
        .get()
        .find(
          (chart) =>
            chart.getName() === dereferencedChartName &&
            chart.getRepository() === deferencedRepository,
        );
    });
  },
});

export default selectedHelmChartInjectable;
