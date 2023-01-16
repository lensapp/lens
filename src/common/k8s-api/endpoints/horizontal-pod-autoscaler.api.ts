/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseKubeObjectCondition, LabelSelector, NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { OptionVarient } from "../../utils";

export enum HpaMetricType {
  Resource = "Resource",
  Pods = "Pods",
  Object = "Object",
  External = "External",
  ContainerResource = "ContainerResource",
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

  // autscaling/v2
  target?: {
    averageUtilization?: number;
    type?: string;
  }
}

export interface ExternalMetricSource {
  metricName?: string;
  metricSelector?: LabelSelector;
  targetAverageValue?: string;
  targetValue?: string;

  // autoscaling/v2
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

  // autoscaling/v2
  metric?: {
    name?: string;
  },
  target: {
    type?: string;
    value?: string;
  };
  describedObject?: CrossVersionObjectReference;
}

export interface PodsMetricSource {
  metricName?: string;
  selector?: LabelSelector;
  targetAverageValue?: string;

  // autoscaling/v2
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

  // autoscaling/v2
  target?: {
    averageUtilization?: number;
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
  container: string;
  currentAverageUtilization?: number;
  currentAverageValue: string;
  name: string;
}

export interface ExternalMetricStatus {
  currentAverageValue?: string;
  currentValue: string;
  metricName: string;
  metricSelector?: LabelSelector;
}

export interface ObjectMetricStatus {
  averageValue?: string;
  currentValue?: string;
  metricName: string;
  selector?: LabelSelector;
  target: CrossVersionObjectReference;
}

export interface PodsMetricStatus {
  currentAverageValue: string;
  metricName: string;
  selector?: LabelSelector;
}

export interface ResourceMetricStatus {
  currentAverageUtilization?: number;
  currentAverageValue: string;
  name: string;
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

interface MetricCurrentTarget {
  current?: string;
  target?: string;
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
    // console.log(this.spec)
    return this.spec.metrics ?? [];
  }

  getCurrentMetrics() {
    // console.log(this.status)
    return this.status?.currentMetrics ?? [];
  }

  getMetricValues(metric: HorizontalPodAutoscalerMetricSpec): string {
    const {
      current = "unknown",
      target = "unknown",
    } = this.getMetricsCurrentAndTarget(metric);

    return `${current} / ${target}`;
  }

  getMetricsCurrentAndTarget(spec: HorizontalPodAutoscalerMetricSpec): MetricCurrentTarget {
    const currentMetrics = this.getCurrentMetrics();
    const currentMetric = currentMetrics.find(m => (
      m.type === spec.type
        && getMetricName(m) === getMetricName(spec)
    ));

    console.log(spec, currentMetrics)
  
    switch (spec.type) {
      case HpaMetricType.Resource:
        return getResourceMetricValue(currentMetric?.resource, spec.resource);
      case HpaMetricType.Pods:
        return getPodsMetricValue(currentMetric?.pods, spec.pods);
      case HpaMetricType.Object:
        return getObjectMetricValue(currentMetric?.object, spec.object);
      case HpaMetricType.External:
        return getExternalMetricValue(currentMetric?.external, spec.external);
      case HpaMetricType.ContainerResource:
        return getContainerResourceMetricValue(currentMetric?.containerResource, spec.containerResource);
      default:
        return {};
    }
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

function getMetricName(metric: HorizontalPodAutoscalerMetricSpec | HorizontalPodAutoscalerMetricStatus): string | undefined {
  switch (metric.type) {
    case HpaMetricType.Resource:
      return metric.resource.name;
    case HpaMetricType.Pods:
      return metric.pods.metricName;
    case HpaMetricType.Object:
      return metric.object.metricName;
    case HpaMetricType.External:
      return metric.external.metricName;
    case HpaMetricType.ContainerResource:
      return metric.containerResource.name;
    default:
      return undefined;
  }
}

function getResourceMetricValue(currentMetric: ResourceMetricStatus | undefined, targetMetric: ResourceMetricSource): MetricCurrentTarget {
  let target = "unknown";

  if (targetMetric.target) {
    target = targetMetric.target.averageUtilization ? `${targetMetric.target.averageUtilization}%` : "unknown";
  } else {
    target = typeof targetMetric?.targetAverageUtilization === "number"
      ? `${targetMetric.targetAverageUtilization}%`
      : targetMetric?.targetAverageValue ?? "unknown";
  }

  return {
    current: (
      typeof currentMetric?.currentAverageUtilization === "number"
        ? `${currentMetric.currentAverageUtilization}%`
        : currentMetric?.currentAverageValue
    ),
    target,
  };
}

function getPodsMetricValue(currentMetric: PodsMetricStatus | undefined, targetMetric: PodsMetricSource): MetricCurrentTarget {
  return {
    current: currentMetric?.currentAverageValue,
    target: targetMetric?.target?.averageValue,
  }

  // v1
  // return {
  //   current: currentMetric?.currentAverageValue,
  //   target: targetMetric?.targetAverageValue,
  // };
}

function getObjectMetricValue(currentMetric: ObjectMetricStatus | undefined, targetMetric: ObjectMetricSource): MetricCurrentTarget {
  return {
    current: (
      currentMetric?.currentValue
        ?? currentMetric?.averageValue
    ),
    target: targetMetric?.target?.value
  };
}

function getExternalMetricValue(currentMetric: ExternalMetricStatus | undefined, targetMetric: ExternalMetricSource): MetricCurrentTarget {
  return {
    current: (
      currentMetric?.currentValue
        ?? currentMetric?.currentAverageValue
    ),
    target: (
      targetMetric?.target?.value
        ?? `${targetMetric?.target?.averageValue} (avg)`
    ),
  };
}

function getContainerResourceMetricValue(currentMetric: ContainerResourceMetricStatus | undefined, targetMetric: ContainerResourceMetricSource): MetricCurrentTarget {
  let target = "unknown";

  if (targetMetric.target) {
    // v2
    target = targetMetric.target.averageUtilization ? `${targetMetric.target.averageUtilization}%` : "unknown";
  } else {
    target = typeof targetMetric?.targetAverageUtilization === "number"
      ? `${targetMetric.targetAverageUtilization}%`
      : targetMetric?.targetAverageValue ?? "unknown";
  }
  
  return {
    current: (
      typeof currentMetric?.currentAverageUtilization === "number"
        ? `${currentMetric.currentAverageUtilization}%`
        : currentMetric?.currentAverageValue
    ),
    target,
  };
}

