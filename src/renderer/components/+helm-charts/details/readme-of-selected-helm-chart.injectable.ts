/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import callForHelmChartReadmeInjectable from "./readme/call-for-helm-chart-readme.injectable";
import helmChartDetailsVersionSelectionInjectable from "./versions/helm-chart-details-version-selection.injectable";
import type { HelmChart } from "../../../../renderer/k8s/helm-chart";

const readmeOfSelectedHelmChartInjectable = getInjectable({
  id: "readme-of-selected-helm-chart",

  instantiate: (di, chart: HelmChart) => {
    const selection = di.inject(helmChartDetailsVersionSelectionInjectable, chart);
    const callForHelmChartReadme = di.inject(callForHelmChartReadmeInjectable);

    return asyncComputed(async () => {
      const chartVersion = selection.value.get();

      if (!chartVersion) {
        return "";
      }

      return await callForHelmChartReadme(
        chartVersion.getRepository(),
        chartVersion.getName(),
        chartVersion.getVersion(),
      );
    }, "");
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, chart: HelmChart) => chart.getId(),
  }),
});

export default readmeOfSelectedHelmChartInjectable;
