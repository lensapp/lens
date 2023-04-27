/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, KubeObjectStatus, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { Container } from "../types/container";
import type { PodSpec } from "./pod";

export interface JobSpec {
  parallelism?: number;
  completions?: number;
  backoffLimit?: number;
  selector?: LabelSelector;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels?: Partial<Record<string, string>>;
      annotations?: Partial<Record<string, string>>;
    };
    spec: PodSpec;
  };
  containers?: Container[];
  restartPolicy?: string;
  terminationGracePeriodSeconds?: number;
  dnsPolicy?: string;
  serviceAccountName?: string;
  serviceAccount?: string;
  schedulerName?: string;
}

export interface JobStatus extends KubeObjectStatus {
  startTime: string;
  completionTime: string;
  succeeded: number;
}

export class Job extends KubeObject<NamespaceScopedMetadata, JobStatus, JobSpec> {
  static readonly kind = "Job";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/batch/v1/jobs";

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec.selector?.matchLabels);
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

  getDesiredCompletions() {
    return this.spec.completions ?? 0;
  }

  getCompletions() {
    return this.status?.succeeded ?? 0;
  }

  getParallelism() {
    return this.spec.parallelism;
  }

  getCondition() {
    // Type of Job condition could be only Complete or Failed
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#jobcondition-v1-batch
    return this.status?.conditions?.find(({ status }) => status === "True");
  }

  getImages() {
    return this.spec.template.spec.containers?.map((container) => container.image) ?? [];
  }
}
