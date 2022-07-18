/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isDefined } from "../../../common/utils";
import { stringify } from "querystring";
import type { RequestInit } from "node-fetch";
import { HelmChart } from "../helm-chart";
import apiBaseInjectable from "../api-base.injectable";

export interface HelmChartDetails {
  readme: string;
  versions: HelmChart[];
}

export interface GetChartDetailsOptions {
  version?: string;
  reqInit?: RequestInit;
}

/**
 * Get the readme and all versions of a chart
 * @param repo The repo to get from
 * @param name The name of the chart to request the data of
 * @param options.version The version of the chart's readme to get, default latest
 * @param options.reqInit A way for passing in an abort controller or other browser request options
 */
export type GetHelmChartDetails = (repo: string, name: string, opts?: GetChartDetailsOptions) => Promise<HelmChartDetails>;

const getHelmChartDetailsInjectable = getInjectable({
  id: "get-helm-chart-details",
  instantiate: (di): GetHelmChartDetails => {
    const apiBase = di.inject(apiBaseInjectable);

    return async (repo, name, { version, reqInit } = {}) => {
      const { readme, versions: rawVersions } = await apiBase.get(`/v2/charts/${repo}/${name}?${stringify({ version })}`, undefined, reqInit) as HelmChartDetails;
      const versions = rawVersions
        .map(version => HelmChart.create(version, { onError: "log" }))
        .filter(isDefined);

      return {
        readme,
        versions,
      };
    };
  },
});

export default getHelmChartDetailsInjectable;
