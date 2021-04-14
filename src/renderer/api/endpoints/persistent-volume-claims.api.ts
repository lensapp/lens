import { KubeObject } from "../kube-object";
import { autobind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import { Pod } from "./pods.api";
import { KubeApi } from "../kube-api";

export class PersistentVolumeClaimsApi extends KubeApi<PersistentVolumeClaimSpec, PersistentVolumeClaimStatus, PersistentVolumeClaim> {
  getMetrics(pvcName: string, namespace: string): Promise<IPvcMetrics> {
    return metricsApi.getMetrics({
      diskUsage: { category: "pvc", pvc: pvcName },
      diskCapacity: { category: "pvc", pvc: pvcName }
    }, {
      namespace
    });
  }
}

export interface IPvcMetrics<T = IMetrics> {
  [key: string]: T;
  diskUsage: T;
  diskCapacity: T;
}

interface PersistentVolumeClaimSpec {
  accessModes: string[];
  storageClassName: string;
  selector: {
    matchLabels: {
      release: string;
    };
    matchExpressions: {
      key: string; // environment,
      operator: string; // In,
      values: string[]; // [dev]
    }[];
  };
  resources: {
    requests: {
      storage: string; // 8Gi
    };
  };
}

interface PersistentVolumeClaimStatus {
  phase: string; // Pending
}

@autobind()
export class PersistentVolumeClaim extends KubeObject<PersistentVolumeClaimSpec, PersistentVolumeClaimStatus> {
  static kind = "PersistentVolumeClaim";
  static namespaced = true;
  static apiBase = "/api/v1/persistentvolumeclaims";

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
    return this.spec?.resources.requests.storage ?? "-";
  }

  getMatchLabels(): string[] {
    return Object.entries(this.spec?.selector.matchLabels ?? {})
      .map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions() {
    return this.spec?.selector.matchExpressions ?? [];
  }

  getStatus(): string {
    return this.status?.phase ?? "-";
  }
}

export const pvcApi = new PersistentVolumeClaimsApi({
  objectConstructor: PersistentVolumeClaim,
});
