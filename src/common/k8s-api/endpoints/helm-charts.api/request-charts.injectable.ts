/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseInjectionToken } from "../../api-base";
import type { RawHelmChart } from "../helm-charts.api";
import { HelmChart } from "../helm-charts.api";
import { isDefined } from "../../../utils";

export type RequestHelmCharts = () => Promise<HelmChart[]>;
export type RepoHelmChartList = Record<string, RawHelmChart[]>;

/**
 * Get a list of all helm charts from all saved helm repos
 */
const requestHelmChartsInjectable = getInjectable({
  id: "request-helm-charts",
  instantiate: (di) => {
    const apiBase = di.inject(apiBaseInjectionToken);

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

export default requestHelmChartsInjectable;
