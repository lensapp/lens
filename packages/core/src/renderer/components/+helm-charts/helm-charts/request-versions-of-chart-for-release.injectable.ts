/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import requestHelmChartVersionsInjectable from "../../../../common/k8s-api/endpoints/helm-charts.api/request-versions.injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { sortBySemverVersion } from "@k8slens/utilities";
import type { HelmChartVersion } from "./versions";

/**
 * @param release The release to try and figure out what chart versions match for
 * @param charts The list of possible helm charts that `release` could be of
 */
export type RequestVersionsOfHelmChart = (release: HelmRelease, charts: HelmChart[]) => Promise<HelmChartVersion[]>;

const requestVersionsOfHelmChartInjectable = getInjectable({
  id: "request-versions-of-helm-chart-for-helm-release-from-list-of-charts",
  instantiate: (di): RequestVersionsOfHelmChart => {
    const requestHelmChartVersions = di.inject(requestHelmChartVersionsInjectable);

    return async (release, charts) => {
      const rawVersions = await Promise.all((
        charts
          .filter(chart => chart.getName() === release.getChart())
          .map(chart => chart.getRepository())
          .map(repo => requestHelmChartVersions(repo, release.getChart()))
      ));

      return sortBySemverVersion(rawVersions.flat());
    };
  },
});

export default requestVersionsOfHelmChartInjectable;
