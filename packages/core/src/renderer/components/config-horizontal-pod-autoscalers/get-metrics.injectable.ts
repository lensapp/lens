/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HorizontalPodAutoscaler, HorizontalPodAutoscalerMetricSpec, HorizontalPodAutoscalerMetricStatus } from "../../../common/k8s-api/endpoints";
import { HpaMetricType } from "../../../common/k8s-api/endpoints";
import { getMetricName } from "./get-metric-name";
import { HorizontalPodAutoscalerV1MetricParser } from "./metric-parser-v1";
import { HorizontalPodAutoscalerV2MetricParser } from "./metric-parser-v2";

type Parser = HorizontalPodAutoscalerV1MetricParser | HorizontalPodAutoscalerV2MetricParser;

const getHorizontalPodAutoscalerMetrics = getInjectable({
  id: "get-horizontal-pod-autoscaler-metrics",
  instantiate: () => (hpa: HorizontalPodAutoscaler) => {
    const hpaV1Parser = new HorizontalPodAutoscalerV1MetricParser();
    const hpaV2Parser = new HorizontalPodAutoscalerV2MetricParser();
    const metrics = hpa.spec?.metrics ?? [];
    const currentMetrics = hpa.status?.currentMetrics ?? [];
    const cpuUtilization = hpa.spec?.targetCPUUtilizationPercentage;

    if (cpuUtilization) {
      const utilizationCurrent = hpa.status?.currentCPUUtilizationPercentage ? `${hpa.status.currentCPUUtilizationPercentage}%` : "unknown";
      const utilizationTarget = cpuUtilization ? `${cpuUtilization}%` : "unknown";

      return [`${utilizationCurrent} / ${utilizationTarget}`];
    }

    return metrics.map((metric) => {
      const currentMetric = currentMetrics.find(current =>
        current.type === metric.type
        && getMetricName(current) === getMetricName(metric),
      );

      const h2Values = getMetricValues<HorizontalPodAutoscalerV2MetricParser>(hpaV2Parser, currentMetric, metric);
      const h1Values = getMetricValues<HorizontalPodAutoscalerV1MetricParser>(hpaV1Parser, currentMetric, metric);
      let values = h1Values;

      if (h2Values.current || h2Values.target) {
        values = h2Values;
      }

      return `${values.current ?? "unknown"} / ${values.target ?? "unknown"}`;
    });
  },
});

function getMetricValues<Type extends Parser>(parser: Type, current: HorizontalPodAutoscalerMetricStatus | undefined, target: HorizontalPodAutoscalerMetricSpec) {
  switch (target.type) {
    case HpaMetricType.Resource:
      return parser.getResource({ current: current?.resource, target: target.resource });
    case HpaMetricType.Pods:
      return parser.getPods({ current: current?.pods, target: target.pods });
    case HpaMetricType.Object:
      return parser.getObject({ current: current?.object, target: target.object });
    case HpaMetricType.External:
      return parser.getExternal({ current: current?.external, target: target.external });
    case HpaMetricType.ContainerResource:
      return parser.getContainerResource({ current: current?.containerResource, target: target.containerResource });
    default:
      return {};
  }
}

export default getHorizontalPodAutoscalerMetrics;
