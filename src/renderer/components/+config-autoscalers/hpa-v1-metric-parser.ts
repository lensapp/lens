import type { ContainerResourceMetricSource, ContainerResourceMetricStatus, ExternalMetricSource, ExternalMetricStatus, MetricCurrentTarget, ObjectMetricSource, ObjectMetricStatus, PodsMetricSource, PodsMetricStatus, ResourceMetricSource, ResourceMetricStatus } from "../../../common/k8s-api/endpoints";

export class HorizontalPodAutoscalerV1MetricParser {
  public getResource({ current, target }: { current: ResourceMetricStatus | undefined, target: ResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        typeof current?.currentAverageUtilization === "number"
          ? `${current.currentAverageUtilization}%`
          : current?.currentAverageValue
      ),
      target: (
        typeof target?.targetAverageUtilization === "number"
          ? `${target.targetAverageUtilization}%`
          : target?.targetAverageValue
      ),
    };
  }
  
  public getPods({ current, target }: { current: PodsMetricStatus | undefined, target: PodsMetricSource }): MetricCurrentTarget {
    return {
      current: current?.currentAverageValue,
      target: target?.targetAverageValue,
    };
  }
  
  public getObject({ current, target }: { current: ObjectMetricStatus | undefined, target: ObjectMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.currentValue
          ?? current?.averageValue
      ),
      target: (
        target?.targetValue
          ?? target?.averageValue
      ),
    };
  }
  
  public getExternal({ current, target }: { current: ExternalMetricStatus | undefined, target: ExternalMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.currentValue
          ?? current?.currentAverageValue
      ),
      target: (
        target?.targetValue
          ?? target?.targetAverageValue
      ),
    };
  }
  
  public getContainerResource({ current, target }: { current: ContainerResourceMetricStatus | undefined, target: ContainerResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        typeof current?.currentAverageUtilization === "number"
          ? `${current.currentAverageUtilization}%`
          : current?.currentAverageValue
      ),
      target: (
        typeof target?.targetAverageUtilization === "number"
          ? `${target.targetAverageUtilization}%`
          : target?.targetAverageValue
      ),
    };
  }
}