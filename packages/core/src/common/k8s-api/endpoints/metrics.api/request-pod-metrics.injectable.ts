/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import type { Pod } from "@k8slens/kube-object";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface PodMetricData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
  cpuRequests: MetricData;
  cpuLimits: MetricData;
  memoryRequests: MetricData;
  memoryLimits: MetricData;
}

export type RequestPodMetrics = (pods: Pod[], namespace: string, selector?: string) => Promise<PodMetricData>;

const requestPodMetricsInjectable = getInjectable({
  id: "request-pod-metrics",
  instantiate: (di): RequestPodMetrics => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (pods, namespace, selector = "pod, namespace") => {
      const podSelector = pods.map(pod => pod.getName()).join("|");
      const opts = { category: "pods", pods: podSelector, namespace, selector };

      return requestMetrics({
        cpuUsage: opts,
        cpuRequests: opts,
        cpuLimits: opts,
        memoryUsage: opts,
        memoryRequests: opts,
        memoryLimits: opts,
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

export default requestPodMetricsInjectable;
