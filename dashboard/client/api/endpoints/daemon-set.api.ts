import get from "lodash/get";
import { PodContainer } from "./pods.api";
import { Affinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class DaemonSet extends WorkloadKubeObject {
  static kind = "DaemonSet"

  spec: {
    selector: {
      matchLabels: {
        [name: string]: string;
      };
    };
    template: {
      metadata: {
        creationTimestamp?: string;
        labels: {
          name: string;
        };
      };
      spec: {
        containers: PodContainer[];
        initContainers?: PodContainer[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        hostPID: boolean;
        affinity?: Affinity;
        nodeSelector?: {
          [selector: string]: string;
        };
        securityContext: {};
        schedulerName: string;
        tolerations: {
          key: string;
          operator: string;
          effect: string;
          tolerationSeconds: number;
        }[];
      };
    };
    updateStrategy: {
      type: string;
      rollingUpdate: {
        maxUnavailable: number;
      };
    };
    revisionHistoryLimit: number;
  }
  status: {
    currentNumberScheduled: number;
    numberMisscheduled: number;
    desiredNumberScheduled: number;
    numberReady: number;
    observedGeneration: number;
    updatedNumberScheduled: number;
    numberAvailable: number;
    numberUnavailable: number;
  }

  getImages(): string[] {
    const containers: PodContainer[] = get(this, "spec.template.spec.containers", []);
    const initContainers: PodContainer[] = get(this, "spec.template.spec.initContainers", []);
    return [...containers, ...initContainers].map(container => container.image);
  }
}

export const daemonSetApi = new KubeApi({
  kind: DaemonSet.kind,
  apiBase: "/apis/apps/v1/daemonsets",
  isNamespaced: true,
  objectConstructor: DaemonSet,
});
