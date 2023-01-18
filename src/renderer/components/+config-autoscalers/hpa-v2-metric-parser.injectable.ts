import { getInjectable } from "@ogre-tools/injectable";
import { HorizontalPodAutoscalerV2MetricParser } from "./hpa-v2-metric-parser";

const horizonalPodAutoscalerV2MetricParser = getInjectable({
  id: "horizontal-pod-autoscaler-v2-metric-parser",
  instantiate: () => {
    return new HorizontalPodAutoscalerV2MetricParser();
  },
})

export default horizonalPodAutoscalerV2MetricParser;