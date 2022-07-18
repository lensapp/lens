/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RawHelmChart, RepoHelmChartList } from "../../../common/helm/chart";
import { isDefined } from "../../../common/utils";
import apiBaseInjectable from "../api-base.injectable";
import { HelmChart } from "../helm-chart";

/**
 * Get a list of all helm charts from all saved helm repos
 */
export type ListHelmCharts = () => Promise<HelmChart[]>;

const listHelmChartsInjectable = getInjectable({
  id: "list-helm-charts",
  instantiate: (di): ListHelmCharts => {
    const apiBase = di.inject(apiBaseInjectable);

    return async () => {
      const data = await apiBase.get<Record<string, RepoHelmChartList>>("/v2/charts");

      return Object
        .values(data)
        .reduce((allCharts, repoCharts) => allCharts.concat(Object.values(repoCharts)), new Array<RawHelmChart[]>())
        .map(([chart]) => HelmChart.create(chart, { onError: "log" }))
        .filter(isDefined);
    };
  },
});

export default listHelmChartsInjectable;
