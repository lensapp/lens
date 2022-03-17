/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { PodMetricData } from "./pods.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { KubeObjectStatus, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { PodTemplateSpec } from "./types/pod-template-spec";

export interface RollingUpdateDaemonSet {
  maxUnavailable?: number | string;
  maxSurge?: number | string;
}

export interface DaemonSetUpdateStrategy {
  type: string;
  rollingUpdate: RollingUpdateDaemonSet;
}

export interface DaemonSetSpec {
  selector: LabelSelector;
  template: PodTemplateSpec;
  updateStrategy: DaemonSetUpdateStrategy;
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
}

export interface DaemonSetStatus extends KubeObjectStatus {
  collisionCount?: number;
  currentNumberScheduled: number;
  desiredNumberScheduled: number;
  numberAvailable?: number;
  numberMisscheduled: number;
  numberReady: number;
  numberUnavailable?: number;
  observedGeneration?: number;
  updatedNumberScheduled?: number;
}

export class DaemonSet extends KubeObject<DaemonSetStatus, DaemonSetSpec, "namespace-scoped"> {
  static kind = "DaemonSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/daemonsets";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.spec?.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.metadata?.labels);
  }

  getTolerations() {
    return this.spec.template.spec?.tolerations ?? [];
  }

  getAffinity() {
    return this.spec.template.spec?.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];
    const initContainers = this.spec.template?.spec?.initContainers ?? [];

    return [...containers, ...initContainers].map(container => container.image);
  }
}

export class DaemonSetApi extends KubeApi<DaemonSet> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: DaemonSet,
    });
  }
}

export function getMetricsForDaemonSets(daemonsets: DaemonSet[], namespace: string, selector = ""): Promise<PodMetricData> {
  const podSelector = daemonsets.map(daemonset => `${daemonset.getName()}-[[:alnum:]]{5}`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export const daemonSetApi = isClusterPageContext()
  ? new DaemonSetApi()
  : undefined as never;
