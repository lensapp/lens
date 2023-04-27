/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, KubeObjectStatus, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { PodTemplateSpec } from "../types/pod-template-spec";

export interface ReplicaSetSpec {
  replicas?: number;
  selector: LabelSelector;
  template?: PodTemplateSpec;
  minReadySeconds?: number;
}

export interface ReplicaSetStatus extends KubeObjectStatus {
  replicas: number;
  fullyLabeledReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  observedGeneration?: number;
}

export class ReplicaSet extends KubeObject<NamespaceScopedMetadata, ReplicaSetStatus, ReplicaSetSpec> {
  static kind = "ReplicaSet";

  static namespaced = true;

  static apiBase = "/apis/apps/v1/replicasets";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.template?.spec?.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.template?.metadata?.labels);
  }

  getTolerations() {
    return this.spec.template?.spec?.tolerations ?? [];
  }

  getAffinity() {
    return this.spec.template?.spec?.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  getDesired() {
    return this.spec.replicas ?? 0;
  }

  getCurrent() {
    return this.status?.availableReplicas ?? 0;
  }

  getReady() {
    return this.status?.readyReplicas ?? 0;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];

    return containers.map((container) => container.image);
  }
}
