/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { GetChartDetailsOptions, IHelmChartDetails } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { getChartDetails } from "../../../common/k8s-api/endpoints/helm-charts.api";

export type GetChartDetails = (repo: string, name: string, opts?: GetChartDetailsOptions) => Promise<IHelmChartDetails>;

const getChartDetailsInjectable = getInjectable({
  id: "get-chart-details",
  instantiate: (): GetChartDetails => getChartDetails,
  causesSideEffects: true,
});

export default getChartDetailsInjectable;
