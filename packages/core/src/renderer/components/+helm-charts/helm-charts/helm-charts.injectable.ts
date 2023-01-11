/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import requestHelmChartsInjectable from "../../../../common/k8s-api/endpoints/helm-charts.api/request-charts.injectable";

const helmChartsInjectable = getInjectable({
  id: "helm-charts",

  instantiate: (di) => {
    const requestHelmCharts = di.inject(requestHelmChartsInjectable);

    return asyncComputed({
      getValueFromObservedPromise: requestHelmCharts,
      valueWhenPending: [],
    });
  },
});

export default helmChartsInjectable;
