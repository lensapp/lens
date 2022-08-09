/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import requestHelmChartVersionsInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/get-versions.injectable";
import requestHelmChartsInjectable from "../../../common/k8s-api/endpoints/helm-charts.api/list.injectable";
import { HelmChartStore } from "./store";

const helmChartStoreInjectable = getInjectable({
  id: "helm-chart-store",
  instantiate: (di) => new HelmChartStore({
    requestHelmCharts: di.inject(requestHelmChartsInjectable),
    requestHelmChartVersions: di.inject(requestHelmChartVersionsInjectable),
  }),
});

export default helmChartStoreInjectable;
