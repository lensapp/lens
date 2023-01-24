/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import requestHelmChartsInjectable from "../../../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import requestVersionsOfHelmChartInjectable from "./request-versions-of-chart-for-release.injectable";
import type { HelmChartVersion } from "./versions";

export type RequestVersionsOfHelmChartFor = (release: HelmRelease) => Promise<HelmChartVersion[]>;

const requestVersionsOfHelmChartForInjectable = getInjectable({
  id: "request-versions-of-helm-chart-for",
  instantiate: (di): RequestVersionsOfHelmChartFor => {
    const requestHelmCharts = di.inject(requestHelmChartsInjectable);
    const requestVersionsOfHelmChart = di.inject(requestVersionsOfHelmChartInjectable);

    return async (release) => {
      const charts = await requestHelmCharts();

      return requestVersionsOfHelmChart(release, charts);
    };
  },
});

export default requestVersionsOfHelmChartForInjectable;

