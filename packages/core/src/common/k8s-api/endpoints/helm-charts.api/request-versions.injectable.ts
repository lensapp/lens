/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { urlBuilderFor, isDefined } from "@k8slens/utilities";
import { HelmChart } from "../helm-charts.api";
import type { RawHelmChart } from "../helm-charts.api";
import apiBaseInjectable from "../../api-base.injectable";

const requestVersionsEndpoint = urlBuilderFor("/v2/charts/:repo/:name/versions");

export type RequestHelmChartVersions = (repo: string, chartName: string) => Promise<HelmChart[]>;

const requestHelmChartVersionsInjectable = getInjectable({
  id: "request-helm-chart-versions",
  instantiate: (di): RequestHelmChartVersions => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (repo, name) => {
      const rawVersions = await apiBase.get(requestVersionsEndpoint.compile({ name, repo })) as RawHelmChart[];

      return rawVersions
        .map(version => HelmChart.create(version, { onError: "log" }))
        .filter(isDefined);
    };
  },
});

export default requestHelmChartVersionsInjectable;
