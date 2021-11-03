/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import get from "lodash/get";
import { autoBind } from "../../utils";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { JsonApiParams } from "../json-api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { IPodContainer, IPodMetrics } from "./pods.api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

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
    selector?: {
      matchLabels: {
        [name: string]: string;
      };
    };
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
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }

  delete() {
    const params: JsonApiParams = {
      query: { propagationPolicy: "Background" },
    };

    return super.delete(params);
  }
}

export class JobApi extends KubeApi<Job> {
}

export function getMetricsForJobs(jobs: Job[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = jobs.map(job => `${job.getName()}-[[:alnum:]]{5}`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

let jobApi: JobApi;

if (isClusterPageContext()) {
  jobApi = new JobApi({
    objectConstructor: Job,
  });
}

export {
  jobApi,
};
