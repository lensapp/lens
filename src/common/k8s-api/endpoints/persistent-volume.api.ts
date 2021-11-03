/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { KubeObject } from "../kube-object";
import { autoBind, unitsToBytes } from "../../utils";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface PersistentVolume {
  spec: {
    capacity: {
      storage: string; // 8Gi
    };
    flexVolume: {
      driver: string; // ceph.rook.io/rook-ceph-system,
      options: {
        clusterNamespace: string; // rook-ceph,
        image: string; // pvc-c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
        pool: string; // replicapool,
        storageClass: string; // rook-ceph-block
      };
    };
    mountOptions?: string[];
    accessModes: string[]; // [ReadWriteOnce]
    claimRef: {
      kind: string; // PersistentVolumeClaim,
      namespace: string; // storage,
      name: string; // nfs-provisioner,
      uid: string; // c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
      apiVersion: string; // v1,
      resourceVersion: string; // 292180
    };
    persistentVolumeReclaimPolicy: string; // Delete,
    storageClassName: string; // rook-ceph-block
    nfs?: {
      path: string;
      server: string;
    };
  };

  status?: {
    phase: string;
    reason?: string;
  };
}

export class PersistentVolume extends KubeObject {
  static kind = "PersistentVolume";
  static namespaced = false;
  static apiBase = "/api/v1/persistentvolumes";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getCapacity(inBytes = false) {
    const capacity = this.spec.capacity;

    if (capacity) {
      if (inBytes) return unitsToBytes(capacity.storage);

      return capacity.storage;
    }

    return 0;
  }

  getStatus() {
    return this.status?.phase || "-";
  }

  getStorageClass(): string {
    return this.spec.storageClassName;
  }

  getClaimRefName(): string {
    return this.spec.claimRef?.name ?? "";
  }

  getStorageClassName() {
    return this.spec.storageClassName || "";
  }
}

let persistentVolumeApi: KubeApi<PersistentVolume>;

if (isClusterPageContext()) {
  persistentVolumeApi = new KubeApi({
    objectConstructor: PersistentVolume,
  });
}

export {
  persistentVolumeApi,
};
