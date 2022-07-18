/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import getHelmChartDetailsInjectable from "../../k8s/helm-charts.api/get-details.injectable";
import listHelmChartsInjectable from "../../k8s/helm-charts.api/list.injectable";
import { HelmChartStore } from "./store";

const helmChartStoreInjectable = getInjectable({
  id: "helm-chart-store",
  instantiate: (di) => new HelmChartStore({
    listHelmCharts: di.inject(listHelmChartsInjectable),
    getHelmChartDetails: di.inject(getHelmChartDetailsInjectable),
  }),
});

export default helmChartStoreInjectable;
