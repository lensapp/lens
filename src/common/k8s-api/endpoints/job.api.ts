/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { PodContainer, PodMetricData, PodSpec } from "./pod.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { KubeObjectScope, KubeObjectStatus, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";

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
  containers?: PodContainer[];
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

export class Job extends KubeObject<JobStatus, JobSpec, KubeObjectScope.Namespace> {
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
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.14/#jobcondition-v1-batch
    return this.status?.conditions?.find(({ status }) => status === "True");
  }

  getImages() {
    return this.spec.template.spec.containers?.map(container => container.image) ?? [];
  }
}

export class JobApi extends KubeApi<Job> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Job,
    });
  }
}

export function getMetricsForJobs(jobs: Job[], namespace: string, selector = ""): Promise<PodMetricData> {
  const podSelector = jobs.map(job => `${job.getName()}-[[:alnum:]]{5}`).join("|");
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

export const jobApi = isClusterPageContext()
  ? new JobApi()
  : undefined as never;
