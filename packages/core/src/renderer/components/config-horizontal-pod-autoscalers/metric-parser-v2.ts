/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MetricCurrentTarget, V2ContainerResourceMetricSource, V2ContainerResourceMetricStatus, V2ExternalMetricSource, V2ExternalMetricStatus, V2ObjectMetricSource, V2ObjectMetricStatus, V2PodsMetricSource, V2PodsMetricStatus, V2ResourceMetricSource, V2ResourceMetricStatus } from "@k8slens/kube-object";

export class HorizontalPodAutoscalerV2MetricParser {
  public getResource({ current, target }: { current: V2ResourceMetricStatus | undefined; target: V2ResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        typeof current?.current?.averageUtilization === "number"
          ? `${current.current?.averageUtilization}%`
          : current?.current?.averageValue
      ),
      target: typeof target?.target?.averageUtilization === "number"
        ? `${target.target.averageUtilization}%`
        : target?.target?.averageValue,
    };
  }

  public getPods({ current, target }: { current: V2PodsMetricStatus | undefined; target: V2PodsMetricSource }): MetricCurrentTarget {
    return {
      current: current?.current?.averageValue,
      target: target?.target?.averageValue,
    };
  }

  public getObject({ current, target }: { current: V2ObjectMetricStatus | undefined; target: V2ObjectMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.value
        ?? current?.current?.averageValue
      ),
      target: (
        target?.target?.value
        ?? target?.target?.averageValue
      ),
    };
  }

  public getExternal({ current, target }: { current: V2ExternalMetricStatus | undefined; target: V2ExternalMetricSource }): MetricCurrentTarget {
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

  public getContainerResource({ current, target }: { current: V2ContainerResourceMetricStatus | undefined; target: V2ContainerResourceMetricSource }): MetricCurrentTarget {
    return {
      current: (
        current?.current?.averageValue
          ?? (current?.current?.averageUtilization ? `${current.current.averageUtilization}%` : undefined)
      ),
      target: (
        target?.target?.averageValue
          ?? (target?.target?.averageUtilization ? `${target.target.averageUtilization}%` : undefined)
      ),
    };
  }
}
