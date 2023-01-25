/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { HpaMetricType } from "../../../common/k8s-api/endpoints";
import type { LabelSelector } from "../../../common/k8s-api/kube-object";

type MetricNames = Partial<Record<"resource" | "pods" | "object" | "external" | "containerResource", {
  name?: string;
  metricName?: string;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
}>>;

interface Metric extends MetricNames {
  type: HpaMetricType;
}

export function getMetricName(metric: Metric | undefined): string | undefined {
  switch (metric?.type) {
    case HpaMetricType.Resource:
      return metric.resource?.name;
    case HpaMetricType.Pods:
      return metric.pods?.metricName || metric.pods?.metric?.name;
    case HpaMetricType.Object:
      return metric.object?.metricName || metric.object?.metric?.name;
    case HpaMetricType.External:
      return metric.external?.metricName || metric.external?.metric?.name;
    case HpaMetricType.ContainerResource:
      return metric.containerResource?.name;
    default:
      return undefined;
  }
}
