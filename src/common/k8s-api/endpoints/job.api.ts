/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { IPodContainer, IPodMetrics } from "./pod.api";
import type { LabelSelector } from "../kube-object";

export class Job extends WorkloadKubeObject {
  static kind = "Job";
  static namespaced = true;
  static apiBase = "/apis/batch/v1/jobs";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare spec: {
    parallelism?: number;
    completions?: number;
    backoffLimit?: number;
    selector?: LabelSelector;
    template: {
      metadata: {
        creationTimestamp?: string;
        labels?: {
          [name: string]: string;
        };
        annotations?: {
          [name: string]: string;
        };
      };
      spec: {
        containers: IPodContainer[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        hostPID: boolean;
        affinity?: IAffinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations?: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
        schedulerName: string;
      };
    };
    containers?: IPodContainer[];
    restartPolicy?: string;
    terminationGracePeriodSeconds?: number;
    dnsPolicy?: string;
    serviceAccountName?: string;
    serviceAccount?: string;
    schedulerName?: string;
  };
  declare status: {
    conditions: {
      type: string;
      status: string;
      lastProbeTime: string;
      lastTransitionTime: string;
      message?: string;
    }[];
    startTime: string;
    completionTime: string;
    succeeded: number;
  };

  getDesiredCompletions() {
    return this.spec.completions || 0;
  }

  getCompletions() {
    return this.status.succeeded || 0;
  }

  getParallelism() {
    return this.spec.parallelism;
  }

  getCondition() {
    // Type of Job condition could be only Complete or Failed
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.14/#jobcondition-v1-batch
    return this.status.conditions?.find(({ status }) => status === "True");
  }

  getImages() {
    const { containers = [] } = this.spec?.template?.spec ?? {};

    return containers.map(container => container.image);
  }
}

export function getMetricsForJobs(jobs: Job[], namespace: string, selector = ""): Promise<IPodMetrics> {
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

export class JobApi extends KubeApi<Job> {
  constructor(args: SpecificApiOptions<Job> = {}) {
    super({
      ...args,
      objectConstructor: Job,
    });
  }
}
