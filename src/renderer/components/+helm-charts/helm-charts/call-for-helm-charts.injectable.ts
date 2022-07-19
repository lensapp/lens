/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";
import { listCharts } from "../../../../common/k8s-api/endpoints/helm-charts.api";

export type CallForHelmCharts = () => Promise<HelmChart[]>;

const callForHelmChartsInjectable = getInjectable({
  id: "call-for-helm-charts",
  instantiate: (): CallForHelmCharts => async () => await listCharts(),
  causesSideEffects: true,
});

export default callForHelmChartsInjectable;
