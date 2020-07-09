import get from "lodash/get";
import { autobind } from "../../utils";
import { Affinity, WorkloadKubeObject } from "../workload-kube-object";
import { PodContainer } from "./pods.api";
import { KubeApi } from "../kube-api";

@autobind()
export class ReplicaSet extends WorkloadKubeObject {
  static kind = "ReplicaSet"

  spec: {
    replicas?: number;
    selector?: {
      matchLabels: {
        [key: string]: string;
      };
    };
    containers?: PodContainer[];
    template?: {
      spec?: {
        affinity?: Affinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
        containers: PodContainer[];
      };
    };
    restartPolicy?: string;
    terminationGracePeriodSeconds?: number;
    dnsPolicy?: string;
    schedulerName?: string;
  }
  status: {
    replicas: number;
    fullyLabeledReplicas: number;
    readyReplicas: number;
    availableReplicas: number;
    observedGeneration: number;
  }

  getImages(): string[] {
    const containers: PodContainer[] = get(this, "spec.template.spec.containers", []);
    return containers.map(container => container.image);
  }
}

export const replicaSetApi = new KubeApi({
  kind: ReplicaSet.kind,
  apiBase: "/apis/apps/v1/replicasets",
  isNamespaced: true,
  objectConstructor: ReplicaSet,
});
