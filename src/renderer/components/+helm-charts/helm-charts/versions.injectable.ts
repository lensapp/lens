/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { coerce } from "semver";
import requestHelmChartVersionsInjectable from "../../../../common/k8s-api/endpoints/helm-charts.api/get-versions.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { sortCompareChartVersions } from "../../../utils";
import helmChartsInjectable from "./helm-charts.injectable";

export interface ChartVersion {
  repo: string;
  version: string;
}

const sortChartVersions = (versions: ChartVersion[]) => (
  versions
    .map(chartVersion => ({ ...chartVersion, __version: coerce(chartVersion.version, { loose: true }) }))
    .sort(sortCompareChartVersions)
    .map(({ __version, ...chartVersion }) => chartVersion)
);

const helmChartVersionsInjectable = getInjectable({
  id: "helm-chart-versions-loader",
  instantiate: (di, release) => {
    const requestHelmChartVersions = di.inject(requestHelmChartVersionsInjectable);
    const helmCharts = di.inject(helmChartsInjectable);

    return asyncComputed(async () => {
      const rawVersions = await Promise.all((
        helmCharts.value.get()
          .filter(chart => chart.getName() === release.getChart())
          .map(chart => chart.getRepository())
          .map(repo => requestHelmChartVersions(repo, release.getChart()))
      ));

      return sortChartVersions(rawVersions.flat());
    }, []);
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, release: HelmRelease) => release.getName(),
  }),
});

export default helmChartVersionsInjectable;
