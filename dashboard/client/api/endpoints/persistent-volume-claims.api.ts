import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { MatchExpression } from "../workload-kube-object";
import { Metrics, metricsApi } from "./metrics.api";
import { Pod } from "./pods.api";
import { KubeApi } from "../kube-api";

export class PersistentVolumeClaimsApi extends KubeApi<PersistentVolumeClaim> {
  getMetrics(pvcName: string, namespace: string): Promise<PvcMetrics> {
    return metricsApi.getMetrics({
      diskUsage: { category: 'pvc', pvc: pvcName },
      diskCapacity: { category: 'pvc', pvc: pvcName }
    }, {
      namespace
    });
  }
}

export interface PvcMetrics<T = Metrics> {
  [key: string]: T;
  diskUsage: T;
  diskCapacity: T;
}

@autobind()
export class PersistentVolumeClaim extends KubeObject {
  static kind = "PersistentVolumeClaim"

  spec: {
    accessModes: string[];
    storageClassName: string;
    selector: {
      matchLabels: {
        release: string;
      };
      matchExpressions: MatchExpression[];
    };
    resources: {
      requests: {
        storage: string; // 8Gi
      };
    };
  }
  status: {
    phase: string; // Pending
  }

  getPods(allPods: Pod[]): Pod[] {
    const pods = allPods.filter(pod => pod.getNs() === this.getNs());
    return pods.filter(pod => {
      return pod.getVolumes().filter(volume =>
        volume.persistentVolumeClaim &&
        volume.persistentVolumeClaim.claimName === this.getName()
      ).length > 0;
    });
  }

  getStorage(): string {
    if (!this.spec.resources || !this.spec.resources.requests) {
      return "-";
    }
    return this.spec.resources.requests.storage;
  }

  getMatchLabels(): string[] {
    if (!this.spec.selector || !this.spec.selector.matchLabels) {
      return [];
    }
    return Object.entries(this.spec.selector.matchLabels)
      .map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions(): MatchExpression[] {
    return this.spec.selector?.matchExpressions;
  }

  getStatus(): string {
    if (this.status) {
      return this.status.phase;
    }
    return "-";
  }
}

export const pvcApi = new PersistentVolumeClaimsApi({
  kind: PersistentVolumeClaim.kind,
  apiBase: "/api/v1/persistentvolumeclaims",
  isNamespaced: true,
  objectConstructor: PersistentVolumeClaim,
});
