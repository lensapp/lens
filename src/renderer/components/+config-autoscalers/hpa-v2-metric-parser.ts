import type { ContainerResourceMetricSource, ContainerResourceMetricStatus, ExternalMetricSource, ExternalMetricStatus, MetricCurrentTarget, ObjectMetricSource, ObjectMetricStatus, PodsMetricSource, PodsMetricStatus, ResourceMetricSource, ResourceMetricStatus } from "../../../common/k8s-api/endpoints";

export class HorizontalPodAutoscalerV2MetricParser {
  public getResource({ current, target }: { current: ResourceMetricStatus | undefined, target: ResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        typeof current?.current?.averageUtilization === "number"
          ? `${current.current?.averageUtilization}%`
          : current?.current?.averageValue
      ),
      target: typeof target?.target?.averageUtilization === "number"
      ? `${target.target.averageUtilization}%`
      : target?.target?.averageValue
    };
  }
  
  public getPods({ current, target }: { current: PodsMetricStatus | undefined, target: PodsMetricSource }): MetricCurrentTarget {
    return {
      current: current?.current?.averageValue,
      target: target?.target?.averageValue,
    }
  }
  
  public getObject({ current, target }: { current: ObjectMetricStatus | undefined, target: ObjectMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.value
        ?? current?.current?.averageValue
      ),
      target: (
        target?.target?.value
        ?? target?.target?.averageValue
      )
    };
  }
  
  public getExternal({ current, target }: { current: ExternalMetricStatus | undefined, target: ExternalMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.value
          ?? current?.current?.averageValue ? `${current?.current?.averageValue} (avg)` : undefined
      ),
      target: (
        target?.target?.value
          ?? `${target?.target?.averageValue ?? "unknown"} (avg)`
      ),
    };
  }
  
  public getContainerResource({ current, target }: { current: ContainerResourceMetricStatus | undefined, target: ContainerResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.averageValue
          ?? current?.current?.averageUtilization ? `${current?.current?.averageUtilization}%` : "unknown"
      ),
      target: (
        target?.target?.averageValue
          ?? target?.target?.averageUtilization ? `${target?.target?.averageUtilization}%` : "unknown"
      ),
    };
  }
}