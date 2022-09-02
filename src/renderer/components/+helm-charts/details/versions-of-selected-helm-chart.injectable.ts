/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import callForHelmChartVersionsInjectable from "./versions/call-for-helm-chart-versions.injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";

const versionsOfSelectedHelmChartInjectable = getInjectable({
  id: "versions-of-selected-helm-chart",

  instantiate: (di, chart: HelmChart) => {
    const callForHelmChartVersions = di.inject(callForHelmChartVersionsInjectable);

    return asyncComputed(
      async () =>
        await callForHelmChartVersions(chart.getRepository(), chart.getName()),
      [],
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, chart: HelmChart) => chart.getId(),
  }),
});

export default versionsOfSelectedHelmChartInjectable;
