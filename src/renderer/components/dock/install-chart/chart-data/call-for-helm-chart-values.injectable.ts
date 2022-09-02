/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getChartValues } from "../../../../../common/k8s-api/endpoints/helm-charts.api";

export type CallForHelmChartValues = (
  repo: string,
  name: string,
  version: string
) => Promise<string>;

const callForHelmChartValuesInjectable = getInjectable({
  id: "call-for-helm-chart-values",
  instantiate: (): CallForHelmChartValues => getChartValues,
  causesSideEffects: true,
});

export default callForHelmChartValuesInjectable;
