/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { PodMetrics } from "@k8slens/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import podMetricsApiInjectable from "../../../common/k8s-api/endpoints/pod-metrics.api.injectable";

export type RequestPodMetricsByNamespace = (namespace: string | undefined) => Promise<PodMetrics[] | null>;

const requestPodMetricsByNamespaceInjectable = getInjectable({
  id: "request-pod-metrics-by-namespace",
  instantiate: (di): RequestPodMetricsByNamespace => {
    const podMetricsApi = di.inject(podMetricsApiInjectable);

    return (namespace) => podMetricsApi.list({ namespace });
  },
});

export default requestPodMetricsByNamespaceInjectable;
