import { autobind } from "../../utils";
import { WorkloadKubeObject, WorkloadSpec } from "../workload-kube-object";
import { Pod } from "./pods.api";
import { KubeApi } from "../kube-api";

export class ReplicaSetApi extends KubeApi<ReplicaSetSpec, ReplicaSetStatus, ReplicaSet> {
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

interface ReplicaSetSpec extends WorkloadSpec {
  replicas?: number;
  template?: {
    metadata: {
      labels: {
        app: string;
      };
    };
    spec?: Pod["spec"];
  };
  minReadySeconds?: number;
}

interface ReplicaSetStatus {
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
}

@autobind()
export class ReplicaSet extends WorkloadKubeObject<ReplicaSetSpec, ReplicaSetStatus> {
  static kind = "ReplicaSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/replicasets";

  getDesired() {
    return this.spec?.replicas ?? 0;
  }

  getCurrent() {
    return this.status?.availableReplicas ?? 0;
  }

  getReady() {
    return this.status?.readyReplicas ?? 0;
  }

  getImages() {
    return this.spec?.template?.spec?.containers?.map(container => container.image) ?? [];
  }
}

export const replicaSetApi = new ReplicaSetApi({
  objectConstructor: ReplicaSet,
});
