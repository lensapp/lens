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
import { autobind } from "../../utils";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { IPodContainer } from "./pods.api";
import { KubeApi } from "../kube-api";
import { JsonApiParams } from "../json-api";

@autobind()
export class Job extends WorkloadKubeObject {
  static kind = "Job";
  static namespaced = true;
  static apiBase = "/apis/batch/v1/jobs";

  spec: {
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
  status: {
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
    const { conditions } = this.status;

    if (!conditions) return;

    return conditions.find(({ status }) => status === "True");
  }

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }

  delete() {
    const params: JsonApiParams = {
      query: { propagationPolicy: "Background" }
    };

    return super.delete(params);
  }
}

export const jobApi = new KubeApi({
  objectConstructor: Job,
});
