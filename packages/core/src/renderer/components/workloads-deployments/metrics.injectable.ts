/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { now } from "mobx-utils";
import type { Deployment } from "@k8slens/kube-object";
import requestPodMetricsForDeploymentsInjectable from "../../../common/k8s-api/endpoints/metrics.api/request-pod-metrics-for-deployments.injectable";

const deploymentMetricsInjectable = getInjectable({
  id: "deployment-metrics",
  instantiate: (di, deployment) => {
    const requestPodMetricsForDeployments = di.inject(requestPodMetricsForDeploymentsInjectable);

    return asyncComputed({
      getValueFromObservedPromise: () => {
        now(60 * 1000);

        return requestPodMetricsForDeployments([deployment], deployment.getNs());
      },
    });
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, deployment: Deployment) => deployment.getId(),
  }),
});

export default deploymentMetricsInjectable;
