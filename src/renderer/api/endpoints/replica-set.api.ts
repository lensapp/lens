import get from "lodash/get";
import { autobind } from "../../utils";
import { WorkloadKubeObject } from "../workload-kube-object";
import { IPodContainer, Pod } from "./pods.api";
import { KubeApi } from "../kube-api";

export class ReplicaSetApi extends KubeApi<ReplicaSet> {
  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  getReplicas(params: { namespace: string; name: string }): Promise<number> {
    return this.request
      .get(this.getScaleApiUrl(params))
      .then(({ status }: any) => status?.replicas);
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.put(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas
        }
      }
    });
  }
}

@autobind()
export class ReplicaSet extends WorkloadKubeObject {
  static kind = "ReplicaSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/replicasets";
  spec: {
    replicas?: number;
    selector: { matchLabels: { [app: string]: string } };
    template?: {
      metadata: {
        labels: {
          app: string;
        };
      };
      spec?: Pod["spec"];
    };
    minReadySeconds?: number;
  };
  status: {
    replicas: number;
    fullyLabeledReplicas?: number;
    readyReplicas?: number;
    availableReplicas?: number;
    observedGeneration?: number;
    conditions?: {
      type: string;
      status: string;
      lastUpdateTime: string;
      lastTransitionTime: string;
      reason: string;
      message: string;
    }[];
  };

  getDesired() {
    return this.spec.replicas || 0;
  }

  getCurrent() {
    return this.status.availableReplicas || 0;
  }

  getReady() {
    return this.status.readyReplicas || 0;
  }

  getImages() {
    const containers: IPodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }
}

export const replicaSetApi = new ReplicaSetApi({
  objectConstructor: ReplicaSet,
});
