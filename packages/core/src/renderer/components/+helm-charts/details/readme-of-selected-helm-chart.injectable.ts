/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import helmChartDetailsVersionSelectionInjectable from "./versions/helm-chart-details-version-selection.injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import requestHelmChartReadmeInjectable from "../../../../common/k8s-api/endpoints/helm-charts.api/request-readme.injectable";

const readmeOfSelectedHelmChartInjectable = getInjectable({
  id: "readme-of-selected-helm-chart",

  instantiate: (di, chart: HelmChart) => {
    const selection = di.inject(
      helmChartDetailsVersionSelectionInjectable,
      chart,
    );
    const requestHelmChartReadme = di.inject(requestHelmChartReadmeInjectable);

    return asyncComputed({
      getValueFromObservedPromise: async () => {
        const chartVersion = selection.value.get();

        if (!chartVersion) {
          return "";
        }

        const result = await requestHelmChartReadme(
          chartVersion.getRepository(),
          chartVersion.getName(),
          chartVersion.getVersion(),
        );

        return result.callWasSuccessful ? result.response : "";
      },

      valueWhenPending: "",
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, chart: HelmChart) => chart.getId(),
  }),
});

export default readmeOfSelectedHelmChartInjectable;
