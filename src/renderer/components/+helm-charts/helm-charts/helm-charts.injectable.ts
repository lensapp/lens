/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import listHelmChartsInjectable from "../../../k8s/helm-charts.api/list.injectable";

const helmChartsInjectable = getInjectable({
  id: "helm-charts",

  instantiate: (di) => {
    const listHelmCharts = di.inject(listHelmChartsInjectable);

    return asyncComputed(async () => await listHelmCharts(), []);
  },
});

export default helmChartsInjectable;
