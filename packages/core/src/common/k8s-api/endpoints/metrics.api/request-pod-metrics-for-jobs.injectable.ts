/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Job } from "@k8slens/kube-object";
import type { MetricData } from "../metrics.api";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface JobPodMetricData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
}

export type RequestPodMetricsForJobs = (jobs: Job[], namespace: string, selector?: string) => Promise<JobPodMetricData>;

const requestPodMetricsForJobsInjectable = getInjectable({
  id: "request-pod-metrics-for-jobs",
  instantiate: (di): RequestPodMetricsForJobs => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (jobs, namespace, selector = "") => {
      const podSelector = jobs.map(job => `${job.getName()}-[[:alnum:]]{5}`).join("|");
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

export default requestPodMetricsForJobsInjectable;
