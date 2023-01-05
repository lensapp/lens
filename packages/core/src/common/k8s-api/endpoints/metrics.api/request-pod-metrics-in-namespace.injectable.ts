/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface PodMetricInNamespaceData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
}

export type RequestPodMetricsInNamespace = (namespace: string, selector?: string) => Promise<PodMetricInNamespaceData>;

const requestPodMetricsInNamespaceInjectable = getInjectable({
  id: "request-pod-metrics-in-namespace",
  instantiate: (di): RequestPodMetricsInNamespace => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (namespace, selector) => {
      const opts = { category: "pods", pods: ".*", namespace, selector };

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

export default requestPodMetricsInNamespaceInjectable;
