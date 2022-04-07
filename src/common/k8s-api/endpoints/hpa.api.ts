/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { BaseKubeObjectCondition, KubeObjectScope, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
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
  resource: ResourceMetricSource;
  object: ObjectMetricSource;
  external: ExternalMetricSource;
  pods: PodsMetricSource;
  containerResource: ContainerResourceMetricSource;
}

export type HorizontalPodAutoscalerMetricSpec =
  | OptionVarient<HpaMetricType.Resource, BaseHorizontalPodAutoscalerMetricSpec, "resource">
  | OptionVarient<HpaMetricType.External, BaseHorizontalPodAutoscalerMetricSpec, "external">
  | OptionVarient<HpaMetricType.Object, BaseHorizontalPodAutoscalerMetricSpec, "object">
  | OptionVarient<HpaMetricType.Pods, BaseHorizontalPodAutoscalerMetricSpec, "pods">
  | OptionVarient<HpaMetricType.ContainerResource, BaseHorizontalPodAutoscalerMetricSpec, "containerResource">;

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
  currentMetrics: HorizontalPodAutoscalerMetricSpec[];
}

interface MetricCurrentTarget {
  current?: string | undefined;
  target?: string | undefined;
}

export class HorizontalPodAutoscaler extends KubeObject<HorizontalPodAutoscalerStatus, HorizontalPodAutoscalerSpec, KubeObjectScope.Namespace> {
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

  protected getMetricName(metric: HorizontalPodAutoscalerMetricSpec): string {
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
        return `<unknown metric type: ${(metric as HorizontalPodAutoscalerMetricSpec).type}>`;
    }
  }

  protected getResourceMetricValue(currentMetric: ResourceMetricSource | undefined, targetMetric: ResourceMetricSource): MetricCurrentTarget {
    return {
      current: (
        currentMetric?.targetAverageUtilization
          ? `${currentMetric.targetAverageUtilization}%`
          : currentMetric?.targetAverageValue
      ),
      target: (
        targetMetric?.targetAverageUtilization
          ? `${targetMetric.targetAverageUtilization}%`
          : targetMetric?.targetAverageValue
      ),
    };
  }

  protected getPodsMetricValue(currentMetric: PodsMetricSource | undefined, targetMetric: PodsMetricSource): MetricCurrentTarget {
    return {
      current: currentMetric?.targetAverageValue,
      target: targetMetric?.targetAverageValue,
    };
  }

  protected getObjectMetricValue(currentMetric: ObjectMetricSource | undefined, targetMetric: ObjectMetricSource): MetricCurrentTarget {
    return {
      current: (
        currentMetric?.targetValue
        ?? currentMetric?.averageValue
      ),
      target: (
        targetMetric?.targetValue
        ?? targetMetric?.averageValue
      ),
    };
  }

  protected getExternalMetricValue(currentMetric: ExternalMetricSource | undefined, targetMetric: ExternalMetricSource): MetricCurrentTarget {
    return {
      current: (
        currentMetric?.targetValue
        ?? currentMetric?.targetAverageValue
      ),
      target: (
        targetMetric?.targetValue
        ?? targetMetric?.targetAverageValue
      ),
    };
  }

  protected getContainerResourceMetricValue(currentMetric: ContainerResourceMetricSource | undefined, targetMetric: ContainerResourceMetricSource): MetricCurrentTarget {
    return {
      current: (
        currentMetric?.targetAverageUtilization
          ? `${currentMetric.targetAverageUtilization}%`
          : currentMetric?.targetAverageValue
      ),
      target: (
        targetMetric?.targetAverageUtilization
          ? `${targetMetric.targetAverageUtilization}%`
          : targetMetric?.targetAverageValue
      ),
    };
  }

  protected getMetricCurrentTarget(metric: HorizontalPodAutoscalerMetricSpec): MetricCurrentTarget {
    const currentMetric = this.getMetrics()
      .find(m => (
        m.type === metric.type
        && this.getMetricName(m) === this.getMetricName(metric)
      ));

    switch (metric.type) {
      case HpaMetricType.Resource:
        return this.getResourceMetricValue(currentMetric?.resource, metric.resource);
      case HpaMetricType.Pods:
        return this.getPodsMetricValue(currentMetric?.pods, metric.pods);
      case HpaMetricType.Object:
        return this.getObjectMetricValue(currentMetric?.object, metric.object);
      case HpaMetricType.External:
        return this.getExternalMetricValue(currentMetric?.external, metric.external);
      case HpaMetricType.ContainerResource:
        return this.getContainerResourceMetricValue(currentMetric?.containerResource, metric.containerResource);
      default:
        return {};
    }
  }

  getMetricValues(metric: HorizontalPodAutoscalerMetricSpec): string {
    const {
      current = "unknown",
      target = "unknown",
    } = this.getMetricCurrentTarget(metric);

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

export const horizontalPodAutoscalerApi = isClusterPageContext()
  ? new HorizontalPodAutoscalerApi()
  : undefined as never;
