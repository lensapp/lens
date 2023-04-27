/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MetricCurrentTarget, V2Beta1ContainerResourceMetricSource, V2Beta1ContainerResourceMetricStatus, V2Beta1ExternalMetricSource, V2Beta1ExternalMetricStatus, V2Beta1ObjectMetricSource, V2Beta1ObjectMetricStatus, V2Beta1PodsMetricSource, V2Beta1PodsMetricStatus, V2Beta1ResourceMetricSource, V2Beta1ResourceMetricStatus } from "@k8slens/kube-object";

export class HorizontalPodAutoscalerV1MetricParser {
  public getResource({ current, target }: { current: V2Beta1ResourceMetricStatus | undefined; target: V2Beta1ResourceMetricSource }): MetricCurrentTarget {
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

  public getPods({ current, target }: { current: V2Beta1PodsMetricStatus | undefined; target: V2Beta1PodsMetricSource }): MetricCurrentTarget {
    return {
      current: current?.currentAverageValue,
      target: target?.targetAverageValue,
    };
  }

  public getObject({ current, target }: { current: V2Beta1ObjectMetricStatus | undefined; target: V2Beta1ObjectMetricSource }): MetricCurrentTarget {
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

  public getExternal({ current, target }: { current: V2Beta1ExternalMetricStatus | undefined; target: V2Beta1ExternalMetricSource }): MetricCurrentTarget {
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

  public getContainerResource({ current, target }: { current: V2Beta1ContainerResourceMetricStatus | undefined; target: V2Beta1ContainerResourceMetricSource }): MetricCurrentTarget {
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
