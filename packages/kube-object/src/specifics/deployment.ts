/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, KubeObjectStatus, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { PodSpec } from "./pod";

export interface DeploymentSpec {
  replicas: number;
  selector: LabelSelector;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels: Partial<Record<string, string>>;
      annotations?: Partial<Record<string, string>>;
    };
    spec: PodSpec;
  };
  strategy: {
    type: string;
    rollingUpdate: {
      maxUnavailable: number;
      maxSurge: number;
    };
  };
}

export interface DeploymentStatus extends KubeObjectStatus {
  observedGeneration: number;
  replicas: number;
  updatedReplicas: number;
  readyReplicas: number;
  availableReplicas?: number;
  unavailableReplicas?: number;
}

export class Deployment extends KubeObject<NamespaceScopedMetadata, DeploymentStatus, DeploymentSpec> {
  static kind = "Deployment";

  static namespaced = true;

  static apiBase = "/apis/apps/v1/deployments";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.spec.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec.template.metadata.labels);
  }

  getTolerations() {
    return this.spec.template.spec.tolerations ?? [];
  }

  getAffinity() {
    return this.spec.template.spec.affinity;
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity() ?? {}).length;
  }

  getConditions(activeOnly = false) {
    const { conditions = [] } = this.status ?? {};

    if (activeOnly) {
      return conditions.filter((c) => c.status === "True");
    }

    return conditions;
  }

  getConditionsText(activeOnly = true) {
    return this.getConditions(activeOnly)
      .map(({ type }) => type)
      .join(" ");
  }

  getReplicas() {
    return this.spec.replicas || 0;
  }
}
