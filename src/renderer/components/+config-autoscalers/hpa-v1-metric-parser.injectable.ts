import { getInjectable } from "@ogre-tools/injectable";
import { HorizontalPodAutoscalerV1MetricParser } from "./hpa-v1-metric-parser";

const horizonalPodAutoscalerV1MetricParser = getInjectable({
  id: "horizontal-pod-autoscaler-v1-metric-parser",
  instantiate: () => {
    return new HorizontalPodAutoscalerV1MetricParser();
  },
})

export default horizonalPodAutoscalerV1MetricParser;