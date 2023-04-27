/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { HpaMetricType, LabelSelector } from "@k8slens/kube-object";

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
    case "Resource":
      return metric.resource?.name;
    case "Pods":
      return metric.pods?.metricName || metric.pods?.metric?.name;
    case "Object":
      return metric.object?.metricName || metric.object?.metric?.name;
    case "External":
      return metric.external?.metricName || metric.external?.metric?.name;
    case "ContainerResource":
      return metric.containerResource?.name;
    default:
      return undefined;
  }
}
