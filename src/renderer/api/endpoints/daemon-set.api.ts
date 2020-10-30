import get from "lodash/get";
import { IPodContainer } from "./pods.api";
import { IAffinity, WorkloadKubeObject } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

@autobind()
export class DaemonSet extends WorkloadKubeObject {
  static kind = "DaemonSet"
  static namespaced = true
  static apiBase = "/apis/apps/v1/daemonsets"

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
        containers: IPodContainer[];
        initContainers?: IPodContainer[];
        restartPolicy: string;
        terminationGracePeriodSeconds: number;
        dnsPolicy: string;
        hostPID: boolean;
        affinity?: IAffinity;
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

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", [])
    const initContainers: IPodContainer[] = get(this, "spec.template.spec.initContainers", [])
    return [...containers, ...initContainers].map(container => container.image)
  }
}

export const daemonSetApi = new KubeApi({
  objectConstructor: DaemonSet,
});
