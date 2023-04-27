/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import type { StatefulSet } from "@k8slens/kube-object";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface StatefulSetPodMetricData {
  cpuUsage: MetricData;
  memoryUsage: MetricData;
  fsUsage: MetricData;
  fsWrites: MetricData;
  fsReads: MetricData;
  networkReceive: MetricData;
  networkTransmit: MetricData;
}

export type RequestPodMetricsForStatefulSets = (statefulSets: StatefulSet[], namespace: string, selector?: string) => Promise<StatefulSetPodMetricData>;

const requestPodMetricsForStatefulSetsInjectable = getInjectable({
  id: "request-pod-metrics-for-stateful-sets",
  instantiate: (di): RequestPodMetricsForStatefulSets => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (statefulSets, namespace, selector = "") => {
      const podSelector = statefulSets.map(statefulset => `${statefulset.getName()}-[[:digit:]]+`).join("|");
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

export default requestPodMetricsForStatefulSetsInjectable;

