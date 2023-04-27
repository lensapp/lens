/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { PersistentVolumeClaimTemplateSpec } from "../types/persistent-volume-claim-template-spec";
import type { PodTemplateSpec } from "../types/pod-template-spec";

export interface StatefulSetSpec {
  serviceName: string;
  replicas: number;
  selector: LabelSelector;
  template: PodTemplateSpec;
  volumeClaimTemplates: PersistentVolumeClaimTemplateSpec[];
}

export interface StatefulSetStatus {
  observedGeneration: number;
  replicas: number;
  currentReplicas: number;
  readyReplicas: number;
  currentRevision: string;
  updateRevision: string;
  collisionCount: number;
}

export class StatefulSet extends KubeObject<NamespaceScopedMetadata, StatefulSetStatus, StatefulSetSpec> {
  static readonly kind = "StatefulSet";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/apps/v1/statefulsets";

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
    return this.spec.template.spec?.affinity ?? {};
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity()).length;
  }

  getReplicas() {
    return this.spec.replicas || 0;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];

    return containers.map((container) => container.image);
  }
}
