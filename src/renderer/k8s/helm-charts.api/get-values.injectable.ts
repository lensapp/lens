/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { stringify } from "querystring";
import apiBaseInjectable from "../api-base.injectable";

/**
 * Get chart values related to a specific repos' version of a chart
 * @param repo The repo to get from
 * @param name The name of the chart to request the data of
 * @param version The version to get the values from
 */
export type GetHelmChartValues = (repo: string, name: string, version: string) => Promise<string>;

const getHelmChartValuesInjectable = getInjectable({
  id: "get-helm-chart-values",
  instantiate: (di): GetHelmChartValues => {
    const apiBase = di.inject(apiBaseInjectable);

    return (repo, name, version) => apiBase.get(`/v2/charts/${repo}/${name}/values?${stringify({ version })}`);
  },
});

export default getHelmChartValuesInjectable;
