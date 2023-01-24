/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface NodeMetricData {
  memoryUsage: MetricData;
  workloadMemoryUsage: MetricData;
  memoryCapacity: MetricData;
  memoryAllocatableCapacity: MetricData;
  cpuUsage: MetricData;
  cpuCapacity: MetricData;
  fsUsage: MetricData;
  fsSize: MetricData;
}

export type RequestAllNodeMetrics = () => Promise<NodeMetricData>;

const requestAllNodeMetricsInjectable = getInjectable({
  id: "request-all-node-metrics",
  instantiate: (di): RequestAllNodeMetrics => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return () => {
      const opts = { category: "nodes" };

      return requestMetrics({
        memoryUsage: opts,
        workloadMemoryUsage: opts,
        memoryCapacity: opts,
        memoryAllocatableCapacity: opts,
        cpuUsage: opts,
        cpuCapacity: opts,
        fsSize: opts,
        fsUsage: opts,
      });
    };
  },
});

export default requestAllNodeMetricsInjectable;
