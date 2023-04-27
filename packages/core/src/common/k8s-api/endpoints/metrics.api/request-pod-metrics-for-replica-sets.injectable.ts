/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import type { ReplicaSet } from "@k8slens/kube-object";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface ReplicaSetPodMetricData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
}

export type RequestPodMetricsForReplicaSets = (replicaSets: ReplicaSet[], namespace: string, selector?: string) => Promise<ReplicaSetPodMetricData>;

const requestPodMetricsForReplicaSetsInjectable = getInjectable({
  id: "request-pod-metrics-for-replica-sets",
  instantiate: (di): RequestPodMetricsForReplicaSets => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (replicaSets, namespace, selector = "") => {
      const podSelector = replicaSets.map(replicaSet => `${replicaSet.getName()}-[[:alnum:]]{5}`).join("|");
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

export default requestPodMetricsForReplicaSetsInjectable;
