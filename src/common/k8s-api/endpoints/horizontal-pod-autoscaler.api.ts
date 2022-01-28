/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";

export enum HpaMetricType {
  Resource = "Resource",
  Pods = "Pods",
  Object = "Object",
  External = "External",
}

export type IHpaMetricData<T = any> = T & {
  target?: {
    kind: string;
    name: string;
    apiVersion: string;
  };
  name?: string;
  metricName?: string;
  currentAverageUtilization?: number;
  currentAverageValue?: string;
  targetAverageUtilization?: number;
  targetAverageValue?: string;
};

export interface IHpaMetric {
  [kind: string]: IHpaMetricData;

  type: HpaMetricType;
  resource?: IHpaMetricData<{ name: string }>;
  pods?: IHpaMetricData;
  external?: IHpaMetricData;
  object?: IHpaMetricData<{
    describedObject: {
      apiVersion: string;
      kind: string;
      name: string;
    };
  }>;
}

export interface HorizontalPodAutoscaler {
  spec: {
    scaleTargetRef: {
      kind: string;
      name: string;
      apiVersion: string;
    };
    minReplicas: number;
    maxReplicas: number;
    metrics: IHpaMetric[];
  };
  status: {
    currentReplicas: number;
    desiredReplicas: number;
    currentMetrics: IHpaMetric[];
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type: string;
    }[];
  };
}

export class HorizontalPodAutoscaler extends KubeObject {
  static kind = "HorizontalPodAutoscaler";
  static namespaced = true;
  static apiBase = "/apis/autoscaling/v2beta1/horizontalpodautoscalers";

  getMaxPods() {
    return this.spec.maxReplicas || 0;
  }

  getMinPods() {
    return this.spec.minReplicas || 0;
  }

  getReplicas() {
    return this.status.currentReplicas;
  }

  getConditions() {
    if (!this.status.conditions) return [];

    return this.status.conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;

      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`,
      };
    });
  }

  getMetrics() {
    return this.spec.metrics || [];
  }

  getCurrentMetrics() {
    return this.status.currentMetrics || [];
  }

  protected getMetricName(metric: IHpaMetric): string {
    const { type, resource, pods, object, external } = metric;

    switch (type) {
      case HpaMetricType.Resource:
        return resource.name;
      case HpaMetricType.Pods:
        return pods.metricName;
      case HpaMetricType.Object:
        return object.metricName;
      case HpaMetricType.External:
        return external.metricName;
    }
  }

  // todo: refactor
  getMetricValues(metric: IHpaMetric): string {
    const metricType = metric.type.toLowerCase();
    const currentMetric = this.getCurrentMetrics().find(current =>
      metric.type == current.type && this.getMetricName(metric) == this.getMetricName(current),
    );
    const current = currentMetric ? currentMetric[metricType] : null;
    const target = metric[metricType];
    let currentValue = "unknown";
    let targetValue = "unknown";

    if (current) {
      currentValue = current.currentAverageUtilization || current.currentAverageValue || current.currentValue;
      if (current.currentAverageUtilization) currentValue += "%";
    }

    if (target) {
      targetValue = target.targetAverageUtilization || target.targetAverageValue || target.targetValue;
      if (target.targetAverageUtilization) targetValue += "%";
    }

    return `${currentValue} / ${targetValue}`;
  }
}

export class HorizontalPodAutoscalerApi extends KubeApi<HorizontalPodAutoscaler> {
  constructor(args: SpecificApiOptions<HorizontalPodAutoscaler> = {}) {
    super({
      ...args,
      objectConstructor: HorizontalPodAutoscaler,
    });
  }
}
