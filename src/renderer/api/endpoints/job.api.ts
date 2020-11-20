import get from "lodash/get";
import { autobind } from "../../utils";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { IPodContainer } from "./pods.api";
import { KubeApi } from "../kube-api";
import { JsonApiParams } from "../json-api";

@autobind()
export class Job extends WorkloadKubeObject {
  static kind = "Job"
  static namespaced = true
  static apiBase = "/apis/batch/v1/jobs"

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
  }
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
  }

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
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", [])
    return [...containers].map(container => container.image)
  }

  delete() {
    const params: JsonApiParams = {
      query: { propagationPolicy: "Background" }
    }
    return super.delete(params)
  }
}

export const jobApi = new KubeApi({
  objectConstructor: Job,
});
