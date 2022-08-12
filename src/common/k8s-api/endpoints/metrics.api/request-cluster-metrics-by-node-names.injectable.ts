/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import type { RequestMetricsParams } from "./request-metrics.injectable";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface ClusterMetricData {
  memoryUsage: MetricData;
  memoryRequests: MetricData;
  memoryLimits: MetricData;
  memoryCapacity: MetricData;
  memoryAllocatableCapacity: MetricData;
  cpuUsage: MetricData;
  cpuRequests: MetricData;
  cpuLimits: MetricData;
  cpuCapacity: MetricData;
  cpuAllocatableCapacity: MetricData;
  podUsage: MetricData;
  podCapacity: MetricData;
  podAllocatableCapacity: MetricData;
  fsSize: MetricData;
  fsUsage: MetricData;
}

export type RequestClusterMetricsByNodeNames = (nodeNames: string[], params?: RequestMetricsParams) => Promise<ClusterMetricData>;

const requestClusterMetricsByNodeNamesInjectable = getInjectable({
  id: "get-cluster-metrics-by-node-names",
  instantiate: (di): RequestClusterMetricsByNodeNames => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (nodeNames, params) => {
      const opts = {
        category: "cluster",
        nodes: nodeNames.join("|"),
      };

      return requestMetrics({
        memoryUsage: opts,
        workloadMemoryUsage: opts,
        memoryRequests: opts,
        memoryLimits: opts,
        memoryCapacity: opts,
        memoryAllocatableCapacity: opts,
        cpuUsage: opts,
        cpuRequests: opts,
        cpuLimits: opts,
        cpuCapacity: opts,
        cpuAllocatableCapacity: opts,
        podUsage: opts,
        podCapacity: opts,
        podAllocatableCapacity: opts,
        fsSize: opts,
        fsUsage: opts,
      }, params);
    };
  },
});

export default requestClusterMetricsByNodeNamesInjectable;
