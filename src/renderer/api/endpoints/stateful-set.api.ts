import { IAffinity, WorkloadKubeObject, WorkloadSpec } from "../workload-kube-object";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

export class StatefulSetApi extends KubeApi<StatefulSetSpec, StatefulSetStatus, StatefulSet> {
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

interface StatefulSetSpec extends WorkloadSpec {
  serviceName: string;
  replicas: number;
  template: {
    metadata: {
      labels: {
        app: string;
      };
    };
    spec: {
      containers: {
        name: string;
        image: string;
        ports: {
          containerPort: number;
          name: string;
        }[];
        volumeMounts: {
          name: string;
          mountPath: string;
        }[];
      }[];
      affinity?: IAffinity;
      nodeSelector?: {
        [selector: string]: string;
      };
      tolerations: {
        key: string;
        operator: string;
        effect: string;
        tolerationSeconds: number;
      }[];
    };
  };
  volumeClaimTemplates: {
    metadata: {
      name: string;
    };
    spec: {
      accessModes: string[];
      resources: {
        requests: {
          storage: string;
        };
      };
    };
  }[];
}

interface StatefulSetStatus {
  observedGeneration: number;
  replicas: number;
  currentReplicas: number;
  readyReplicas: number;
  currentRevision: string;
  updateRevision: string;
  collisionCount: number;
}

@autobind()
export class StatefulSet extends WorkloadKubeObject<StatefulSetSpec, StatefulSetStatus> {
  static kind = "StatefulSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/statefulsets";

  getReplicas() {
    return this.spec?.replicas ?? 0;
  }

  getImages() {
    return this.spec?.template.spec.containers.map(container => container.image) ?? [];
  }
}

export const statefulSetApi = new StatefulSetApi({
  objectConstructor: StatefulSet,
});
