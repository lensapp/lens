import { KubeObject } from "../kube-object";
import { unitsToBytes } from "../../utils/convertMemory";
import { autobind } from "../../utils";
import { KubeApi } from "../kube-api";

interface PersistentVolumeSpec {
  capacity: {
    storage: string; // 8Gi
  };
  flexVolume: {
    driver: string;
    options: {
      clusterNamespace: string;
      image: string;
      pool: string;
      storageClass: string;
    };
  };
  mountOptions?: string[];
  accessModes: string[];
  claimRef: {
    kind: string; // PersistentVolumeClaim,
    namespace: string; // storage,
    name: string; // nfs-provisioner,
    uid: string; // c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
    apiVersion: string; // v1,
    resourceVersion: string; // 292180
  };
  persistentVolumeReclaimPolicy: string;
  storageClassName: string;
  nfs?: {
    path: string;
    server: string;
  };
}

interface PersistentVolumeStatus {
  phase: string;
  reason?: string;
}

@autobind()
export class PersistentVolume extends KubeObject<PersistentVolumeSpec, PersistentVolumeStatus> {
  static kind = "PersistentVolume";
  static namespaced = false;
  static apiBase = "/api/v1/persistentvolumes";

  getCapacity(inBytes = false) {
    const storage = this.spec?.capacity?.storage ?? "0";

    if (inBytes) {
      return unitsToBytes(storage);
    }

    return storage;
  }

  getStatus() {
    return this.status?.phase ?? "-";
  }

  getStorageClass(): string {
    return this.spec?.storageClassName ?? "";
  }

  getClaimRefName(): string {
    return this.spec?.claimRef?.name ?? "";
  }

  getStorageClassName() {
    return this.spec?.storageClassName ?? "";
  }
}

export const persistentVolumeApi = new KubeApi({
  objectConstructor: PersistentVolume,
});
