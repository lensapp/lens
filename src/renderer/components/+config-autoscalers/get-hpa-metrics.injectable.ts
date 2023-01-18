import { getInjectable } from "@ogre-tools/injectable";
import { HorizontalPodAutoscaler, HorizontalPodAutoscalerMetricSpec, HorizontalPodAutoscalerMetricStatus, HpaMetricType } from "../../../common/k8s-api/endpoints";
import horizonalPodAutoscalerV1MetricParser from "./hpa-v1-metric-parser.injectable";
import type { HorizontalPodAutoscalerV2MetricParser } from "./hpa-v2-metric-parser";
import horizonalPodAutoscalerV2MetricParser from "./hpa-v2-metric-parser.injectable";

const getHorizontalPodAutoscalerMetrics = getInjectable({
  id: "get-horizontal-pod-autoscaler-metrics",
  instantiate: (di) => (hpa: HorizontalPodAutoscaler) => {
    const hpaV1Parser = di.inject(horizonalPodAutoscalerV1MetricParser);
    const hpaV2Parser = di.inject(horizonalPodAutoscalerV2MetricParser);
    const metrics = hpa.spec?.metrics ?? [];
    const currentMetrics = hpa.status?.currentMetrics ?? [];

    return metrics.map((metric) => {
      const currentMetric = currentMetrics.find(current =>
        current.type === metric.type
        && getMetricName(current) === getMetricName(metric)
      );
      const parser = hpa.apiVersion.includes("v2") ? hpaV2Parser : hpaV1Parser;

      const values = getMetricValues(parser, currentMetric, metric);

      return `${values.current ?? "unknown"} / ${values.target ?? "unknown"}`;
    });
  },
})

function getMetricValues(parser: HorizontalPodAutoscalerV2MetricParser, current: HorizontalPodAutoscalerMetricStatus | undefined, target: HorizontalPodAutoscalerMetricSpec) {
  switch (target.type) {
    case HpaMetricType.Resource:
      return parser.getResource({ current: current?.resource, target: target.resource});
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

function getMetricName(metric: HorizontalPodAutoscalerMetricSpec | HorizontalPodAutoscalerMetricStatus): string | undefined {
  switch (metric.type) {
    case HpaMetricType.Resource:
      return metric.resource.name;
    case HpaMetricType.Pods:
      return metric.pods.metricName || metric.pods.metric?.name;
    case HpaMetricType.Object:
      return metric.object.metricName || metric.object.metric?.name;
    case HpaMetricType.External:
      return metric.external.metricName || metric.external.metric?.name;
    case HpaMetricType.ContainerResource:
      return metric.containerResource.name;
    default:
      return undefined;
  }
}

export default getHorizontalPodAutoscalerMetrics;