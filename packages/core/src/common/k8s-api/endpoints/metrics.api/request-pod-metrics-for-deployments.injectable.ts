/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Deployment } from "@k8slens/kube-object";
import type { MetricData } from "../metrics.api";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface DeploymentPodMetricData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
}

export type RequestPodMetricsForDeployments = (deployments: Deployment[], namespace: string, selector?: string) => Promise<DeploymentPodMetricData>;

const requestPodMetricsForDeploymentsInjectable = getInjectable({
  id: "request-pod-metrics-for-deployments",
  instantiate: (di): RequestPodMetricsForDeployments => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (deployments, namespace, selector = "") => {
      const podSelector = deployments.map(deployment => `${deployment.getName()}-[[:alnum:]]{9,}-[[:alnum:]]{5}`).join("|");
      const opts = { category: "pods", pods: podSelector, namespace, selector };

      return requestMetrics({
        cpuUsage: opts,
        memoryUsage: opts,
        fsUsage: opts,
        fsWrites: opts,
        fsReads: opts,
        networkReceive: opts,
        networkTransmit: opts,
      }, {
        namespace,
      });
    };
  },
});

export default requestPodMetricsForDeploymentsInjectable;
