/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OptionVarient } from "../../utils";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { BaseKubeObjectCondition, LabelSelector, NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";

export enum HpaMetricType {
  Resource = "Resource",
  Pods = "Pods",
  Object = "Object",
  External = "External",
  ContainerResource = "ContainerResource",
}

export interface MetricCurrentTarget {
  current?: string;
  target?: string;
}

export interface HorizontalPodAutoscalerMetricTarget {
  kind: string;
  name: string;
  apiVersion: string;
}

export interface ContainerResourceMetricSource {
  container: string;
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
  target?: {
    averageUtilization?: number;
    averageValue?: string;
    type?: string;
  }
}

export interface ExternalMetricSource {
  metricName?: string;
  metricSelector?: LabelSelector;
  targetAverageValue?: string;
  targetValue?: string;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  },
  target?: {
    type: string;
    value?: string;
    averageValue?: string;
  }
}

export interface ObjectMetricSource {
  averageValue?: string;
  metricName?: string;
  selector?: LabelSelector;
  targetValue?: string;
  metric?: {
    name?: string;
  },
  target?: {
    type?: string;
    value?: string;
    averageValue?: string;
  };
  describedObject?: CrossVersionObjectReference
}

export interface PodsMetricSource {
  metricName?: string;
  selector?: LabelSelector;
  targetAverageValue?: string;
  metric?: {
    name?: string;
  }
  target?: {
    averageValue?: string;
    type?: string;
  }
}

export interface ResourceMetricSource {
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
  target?: {
    averageUtilization?: number;
    averageValue?: string;
    type?: string;
  }
}

export interface BaseHorizontalPodAutoscalerMetricSpec {
  containerResource: ContainerResourceMetricSource;
  external: ExternalMetricSource;
  object: ObjectMetricSource;
  pods: PodsMetricSource;
  resource: ResourceMetricSource;
}

export type HorizontalPodAutoscalerMetricSpec =
  | OptionVarient<HpaMetricType.Resource, BaseHorizontalPodAutoscalerMetricSpec, "resource">
  | OptionVarient<HpaMetricType.External, BaseHorizontalPodAutoscalerMetricSpec, "external">
  | OptionVarient<HpaMetricType.Object, BaseHorizontalPodAutoscalerMetricSpec, "object">
  | OptionVarient<HpaMetricType.Pods, BaseHorizontalPodAutoscalerMetricSpec, "pods">
  | OptionVarient<HpaMetricType.ContainerResource, BaseHorizontalPodAutoscalerMetricSpec, "containerResource">;

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

export interface ContainerResourceMetricStatus {
  container?: string;
  currentAverageUtilization?: number;
  currentAverageValue?: string;
  name: string;
  current?: {
    averageUtilization?: number;
    averageValue?: string;
  }
}

export interface ExternalMetricStatus {
  currentAverageValue?: string;
  currentValue?: string;
  metricName?: string;
  metricSelector?: LabelSelector;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  },
  current?: {
    averageValue?: string;
    value?: string;
  }
}

export interface ObjectMetricStatus {
  averageValue?: string;
  currentValue?: string;
  metricName?: string;
  selector?: LabelSelector;
  metric?: {
    name?: string;
    selector?: LabelSelector;
  },
  current?: {
    type?: string;
    value?: string;
    averageValue?: string;
  };
  describedObject?: CrossVersionObjectReference;
}

export interface PodsMetricStatus {
  currentAverageValue?: string;
  metricName?: string;
  selector?: LabelSelector;
  metric?: {
    name?: string;
  }
  current?: {
    averageValue?: string;
  }
}

export interface ResourceMetricStatus {
  currentAverageUtilization?: number;
  currentAverageValue?: string;
  name: string;
  current?: {
    averageUtilization?: number;
    averageValue?: string;
  }
}

export interface BaseHorizontalPodAutoscalerMetricStatus {
  containerResource: ContainerResourceMetricStatus;
  external: ExternalMetricStatus;
  object: ObjectMetricStatus;
  pods: PodsMetricStatus;
  resource: ResourceMetricStatus;
}

export type HorizontalPodAutoscalerMetricStatus =
  | OptionVarient<HpaMetricType.Resource, BaseHorizontalPodAutoscalerMetricStatus, "resource">
  | OptionVarient<HpaMetricType.External, BaseHorizontalPodAutoscalerMetricStatus, "external">
  | OptionVarient<HpaMetricType.Object, BaseHorizontalPodAutoscalerMetricStatus, "object">
  | OptionVarient<HpaMetricType.Pods, BaseHorizontalPodAutoscalerMetricStatus, "pods">
  | OptionVarient<HpaMetricType.ContainerResource, BaseHorizontalPodAutoscalerMetricStatus, "containerResource">;

export interface CrossVersionObjectReference {
  kind: string;
  name: string;
  apiVersion: string;
}

export interface HorizontalPodAutoscalerSpec {
  scaleTargetRef: CrossVersionObjectReference;
  minReplicas?: number;
  maxReplicas: number;
  metrics?: HorizontalPodAutoscalerMetricSpec[];
  behavior?: HorizontalPodAutoscalerBehavior;
}

export interface HorizontalPodAutoscalerStatus {
  conditions?: BaseKubeObjectCondition[];
  currentReplicas: number;
  desiredReplicas: number;
  currentMetrics?: HorizontalPodAutoscalerMetricStatus[];
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
    return this.status?.conditions?.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;

      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`,
      };
    }) ?? [];
  }

  getMetrics() {
    return this.spec.metrics ?? [];
  }

  getCurrentMetrics() {
    return this.status?.currentMetrics ?? [];
  }
}

export class HorizontalPodAutoscalerApi extends KubeApi<HorizontalPodAutoscaler> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...opts ?? {},
      objectConstructor: HorizontalPodAutoscaler,
      // checkPreferredVersion: true,
      // // Kubernetes < 1.26
      // fallbackApiBases: [
      //   "/apis/autoscaling/v2beta2/horizontalpodautoscalers",
      //   "/apis/autoscaling/v2beta1/horizontalpodautoscalers",
      //   "/apis/autoscaling/v1/horizontalpodautoscalers",
      // ],
    });
  }
}
