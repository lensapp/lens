/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OptionVariant } from "@k8slens/utilities";
import type { LabelSelector, BaseKubeObjectCondition, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { CrossVersionObjectReference } from "../types/cross-version-object-reference";

export type HpaMetricType = "Resource" | "Pods" | "Object" | "External" | "ContainerResource";

export interface MetricCurrentTarget {
  current?: string;
  target?: string;
}

export interface HorizontalPodAutoscalerMetricTarget {
  kind: string;
  name: string;
  apiVersion: string;
}

export interface V2ContainerResourceMetricSource {
  container: string;
  name: string;
  target?: {
    averageUtilization?: number;
    averageValue?: string;
    type?: string;
  };
}

export interface V2Beta1ContainerResourceMetricSource {
  container: string;
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
}

export type ContainerResourceMetricSource = V2ContainerResourceMetricSource | V2Beta1ContainerResourceMetricSource;

export interface V2ExternalMetricSource {
  metricName?: string;
  metricSelector?: LabelSelector;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  target?: {
    type: string;
    value?: string;
    averageValue?: string;
  };
}

export interface V2Beta1ExternalMetricSource {
  metricName?: string;
  metricSelector?: LabelSelector;
  targetAverageValue?: string;
  targetValue?: string;
  metric?: {
    selector?: LabelSelector;
  };
}

export type ExternalMetricSource = V2Beta1ExternalMetricSource | V2ExternalMetricSource;

export interface V2ObjectMetricSource {
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  target?: {
    type?: string;
    value?: string;
    averageValue?: string;
  };
  describedObject?: CrossVersionObjectReference;
}

export interface V2Beta1ObjectMetricSource {
  averageValue?: string;
  metricName?: string;
  selector?: LabelSelector;
  targetValue?: string;
  describedObject?: CrossVersionObjectReference;
}

export type ObjectMetricSource = V2ObjectMetricSource | V2Beta1ObjectMetricSource;

export interface V2PodsMetricSource {
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  target?: {
    averageValue?: string;
    type?: string;
  };
}

export interface V2Beta1PodsMetricSource {
  metricName?: string;
  selector?: LabelSelector;
  targetAverageValue?: string;
}

export type PodsMetricSource = V2PodsMetricSource | V2Beta1PodsMetricSource;

export interface V2ResourceMetricSource {
  name: string;
  target?: {
    averageUtilization?: number;
    averageValue?: string;
    type?: string;
  };
}

export interface V2Beta1ResourceMetricSource {
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
}

export type ResourceMetricSource = V2ResourceMetricSource | V2Beta1ResourceMetricSource;

export interface BaseHorizontalPodAutoscalerMetricSpec {
  containerResource: ContainerResourceMetricSource;
  external: ExternalMetricSource;
  object: ObjectMetricSource;
  pods: PodsMetricSource;
  resource: ResourceMetricSource;
}

export type HorizontalPodAutoscalerMetricSpec =
  | OptionVariant<"Resource", BaseHorizontalPodAutoscalerMetricSpec, "resource">
  | OptionVariant<"External", BaseHorizontalPodAutoscalerMetricSpec, "external">
  | OptionVariant<"Object", BaseHorizontalPodAutoscalerMetricSpec, "object">
  | OptionVariant<"Pods", BaseHorizontalPodAutoscalerMetricSpec, "pods">
  | OptionVariant<"ContainerResource", BaseHorizontalPodAutoscalerMetricSpec, "containerResource">;

interface HorizontalPodAutoscalerBehavior {
  scaleUp?: HPAScalingRules;
  scaleDown?: HPAScalingRules;
}

interface HPAScalingRules {
  stabilizationWindowSecond?: number;
  selectPolicy?: ScalingPolicySelect;
  policies?: HPAScalingPolicy[];
}

type ScalingPolicySelect = string;

interface HPAScalingPolicy {
  type: HPAScalingPolicyType;
  value: number;
  periodSeconds: number;
}

type HPAScalingPolicyType = string;

export interface V2ContainerResourceMetricStatus {
  container?: string;
  name: string;
  current?: {
    averageUtilization?: number;
    averageValue?: string;
  };
}

export interface V2Beta1ContainerResourceMetricStatus {
  container?: string;
  currentAverageUtilization?: number;
  currentAverageValue?: string;
  name: string;
}

export type ContainerResourceMetricStatus = V2ContainerResourceMetricStatus | V2Beta1ContainerResourceMetricStatus;

export interface V2ExternalMetricStatus {
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  current?: {
    averageValue?: string;
    value?: string;
  };
}

export interface V2Beta1ExternalMetricStatus {
  currentAverageValue?: string;
  currentValue?: string;
  metricName?: string;
  metricSelector?: LabelSelector;
}

export type ExternalMetricStatus = V2Beta1ExternalMetricStatus | V2ExternalMetricStatus;

export interface V2ObjectMetricStatus {
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  current?: {
    type?: string;
    value?: string;
    averageValue?: string;
  };
  describedObject?: CrossVersionObjectReference;
}

export interface V2Beta1ObjectMetricStatus {
  averageValue?: string;
  currentValue?: string;
  metricName?: string;
  selector?: LabelSelector;
  describedObject?: CrossVersionObjectReference;
}

export type ObjectMetricStatus = V2Beta1ObjectMetricStatus | V2ObjectMetricStatus;

export interface V2PodsMetricStatus {
  selector?: LabelSelector;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  };
  current?: {
    averageValue?: string;
  };
}

export interface V2Beta1PodsMetricStatus {
  currentAverageValue?: string;
  metricName?: string;
  selector?: LabelSelector;
}

export type PodsMetricStatus = V2Beta1PodsMetricStatus | V2PodsMetricStatus;

export interface V2ResourceMetricStatus {
  name: string;
  current?: {
    averageUtilization?: number;
    averageValue?: string;
  };
}

export interface V2Beta1ResourceMetricStatus {
  currentAverageUtilization?: number;
  currentAverageValue?: string;
  name: string;
}

export type ResourceMetricStatus = V2Beta1ResourceMetricStatus | V2ResourceMetricStatus;

export interface BaseHorizontalPodAutoscalerMetricStatus {
  containerResource: ContainerResourceMetricStatus;
  external: ExternalMetricStatus;
  object: ObjectMetricStatus;
  pods: PodsMetricStatus;
  resource: ResourceMetricStatus;
}

export type HorizontalPodAutoscalerMetricStatus =
  | OptionVariant<"Resource", BaseHorizontalPodAutoscalerMetricStatus, "resource">
  | OptionVariant<"External", BaseHorizontalPodAutoscalerMetricStatus, "external">
  | OptionVariant<"Object", BaseHorizontalPodAutoscalerMetricStatus, "object">
  | OptionVariant<"Pods", BaseHorizontalPodAutoscalerMetricStatus, "pods">
  | OptionVariant<"ContainerResource", BaseHorizontalPodAutoscalerMetricStatus, "containerResource">;

export interface HorizontalPodAutoscalerSpec {
  scaleTargetRef: CrossVersionObjectReference;
  minReplicas?: number;
  maxReplicas: number;
  metrics?: HorizontalPodAutoscalerMetricSpec[];
  behavior?: HorizontalPodAutoscalerBehavior;
  targetCPUUtilizationPercentage?: number; // used only in autoscaling/v1
}

export interface HorizontalPodAutoscalerStatus {
  conditions?: BaseKubeObjectCondition[];
  currentReplicas: number;
  desiredReplicas: number;
  currentMetrics?: HorizontalPodAutoscalerMetricStatus[];
  currentCPUUtilizationPercentage?: number; // used only in autoscaling/v1
}

export class HorizontalPodAutoscaler extends KubeObject<
  NamespaceScopedMetadata,
  HorizontalPodAutoscalerStatus,
  HorizontalPodAutoscalerSpec
> {
  static readonly kind = "HorizontalPodAutoscaler";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/autoscaling/v2/horizontalpodautoscalers";

  getMaxPods() {
    return this.spec.maxReplicas ?? 0;
  }

  getMinPods() {
    return this.spec.minReplicas ?? 0;
  }

  getReplicas() {
    return this.status?.currentReplicas ?? 0;
  }

  getReadyConditions() {
    return this.getConditions().filter(({ isReady }) => isReady);
  }

  getConditions() {
    return (
      this.status?.conditions?.map((condition) => {
        const { message, reason, lastTransitionTime, status } = condition;

        return {
          ...condition,
          isReady: status === "True",
          tooltip: `${message || reason} (${lastTransitionTime})`,
        };
      }) ?? []
    );
  }

  getMetrics() {
    return this.spec.metrics ?? [];
  }

  getCurrentMetrics() {
    return this.status?.currentMetrics ?? [];
  }
}
