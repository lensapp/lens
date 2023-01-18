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
    const currentAverage = current?.current?.averageValue ? `${current?.current?.averageValue} (avg)` : undefined;
    const targetAverage = target?.target?.averageValue ? `${target?.target?.averageValue} (avg)` : undefined;
    return {
      current: (
        current?.current?.value
          ?? currentAverage
      ),
      target: (
        target?.target?.value
          ?? targetAverage
      ),
    };
  }
  
  public getContainerResource({ current, target }: { current: ContainerResourceMetricStatus | undefined, target: ContainerResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.averageValue
          ?? current?.current?.averageUtilization ? `${current?.current?.averageUtilization}%` : undefined
      ),
      target: (
        target?.target?.averageValue
          ?? target?.target?.averageUtilization ? `${target?.target?.averageUtilization}%` : undefined
      ),
    };
  }
}