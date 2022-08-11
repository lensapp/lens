/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseKubeObjectCondition, LabelSelector, NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
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
}

export interface ExternalMetricSource {
  metricName: string;
  metricSelector?: LabelSelector;
  targetAverageValue?: string;
  targetValue?: string;
}

export interface ObjectMetricSource {
  averageValue?: string;
  metricName: string;
  selector?: LabelSelector;
  target: CrossVersionObjectReference;
  targetValue: string;
}

export interface PodsMetricSource {
  metricName: string;
  selector?: LabelSelector;
  targetAverageValue: string;
}

export interface ResourceMetricSource {
  name: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
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
  static readonly apiBase = "/apis/autoscaling/v2beta1/horizontalpodautoscalers";

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

  getMetricValues(metric: HorizontalPodAutoscalerMetricSpec): string {
    const {
      current = "unknown",
      target = "unknown",
    } = getMetricCurrentTarget(metric, this.getCurrentMetrics());

    return `${current} / ${target}`;
  }
}

export class HorizontalPodAutoscalerApi extends KubeApi<HorizontalPodAutoscaler> {
  constructor(opts?: DerivedKubeApiOptions) {
    super({
      objectConstructor: HorizontalPodAutoscaler,
      ...opts ?? {},
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
  return {
    current: (
      typeof currentMetric?.currentAverageUtilization === "number"
        ? `${currentMetric.currentAverageUtilization}%`
        : currentMetric?.currentAverageValue
    ),
    target: (
      typeof targetMetric?.targetAverageUtilization === "number"
        ? `${targetMetric.targetAverageUtilization}%`
        : targetMetric?.targetAverageValue
    ),
  };
}

function getPodsMetricValue(currentMetric: PodsMetricStatus | undefined, targetMetric: PodsMetricSource): MetricCurrentTarget {
  return {
    current: currentMetric?.currentAverageValue,
    target: targetMetric?.targetAverageValue,
  };
}

function getObjectMetricValue(currentMetric: ObjectMetricStatus | undefined, targetMetric: ObjectMetricSource): MetricCurrentTarget {
  return {
    current: (
      currentMetric?.currentValue
        ?? currentMetric?.averageValue
    ),
    target: (
      targetMetric?.targetValue
        ?? targetMetric?.averageValue
    ),
  };
}

function getExternalMetricValue(currentMetric: ExternalMetricStatus | undefined, targetMetric: ExternalMetricSource): MetricCurrentTarget {
  return {
    current: (
      currentMetric?.currentValue
        ?? currentMetric?.currentAverageValue
    ),
    target: (
      targetMetric?.targetValue
        ?? targetMetric?.targetAverageValue
    ),
  };
}

function getContainerResourceMetricValue(currentMetric: ContainerResourceMetricStatus | undefined, targetMetric: ContainerResourceMetricSource): MetricCurrentTarget {
  return {
    current: (
      typeof currentMetric?.currentAverageUtilization === "number"
        ? `${currentMetric.currentAverageUtilization}%`
        : currentMetric?.currentAverageValue
    ),
    target: (
      typeof targetMetric?.targetAverageUtilization === "number"
        ? `${targetMetric.targetAverageUtilization}%`
        : targetMetric?.targetAverageValue
    ),
  };
}

function getMetricCurrentTarget(spec: HorizontalPodAutoscalerMetricSpec, status: HorizontalPodAutoscalerMetricStatus[]): MetricCurrentTarget {
  const currentMetric = status.find(m => (
    m.type === spec.type
      && getMetricName(m) === getMetricName(spec)
  ));

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
