/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HelmChartStore } from "./helm-chart.store";

const helmChartStoreInjectable = getInjectable({
  id: "helm-chart-store",
  instantiate: () => new HelmChartStore(),
});

export default helmChartStoreInjectable;
