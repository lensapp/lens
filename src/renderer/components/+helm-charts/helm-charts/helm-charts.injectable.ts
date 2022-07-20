/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import callForHelmChartsInjectable from "./call-for-helm-charts.injectable";

const helmChartsInjectable = getInjectable({
  id: "helm-charts",

  instantiate: (di) => {
    const callForHelmCharts = di.inject(callForHelmChartsInjectable);

    return asyncComputed(async () => await callForHelmCharts(), []);
  },
});

export default helmChartsInjectable;
