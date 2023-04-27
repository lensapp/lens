/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, KubeObjectStatus, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { PodTemplateSpec } from "../types/pod-template-spec";

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

export class DaemonSet extends KubeObject<NamespaceScopedMetadata, DaemonSetStatus, DaemonSetSpec> {
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

    return [...containers, ...initContainers].map((container) => container.image);
  }
}
