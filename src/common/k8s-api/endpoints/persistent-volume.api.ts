/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, ObjectReference, TypedLocalObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import { unitsToBytes } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
import type { ResourceRequirements } from "./types/resource-requirements";

export interface PersistentVolumeSpec {
  /**
   * AccessModes contains the desired access modes the volume should have.
   *
   * More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1
   */
  accessModes?: string[];
  dataSource?: TypedLocalObjectReference;
  dataSourceRef?: TypedLocalObjectReference;
  resources?: ResourceRequirements;
  selector?: LabelSelector;

  /**
   * Name of the StorageClass required by the claim.
   *
   * More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1
   */
  storageClassName?: string;

  /**
   * Defines what type of volume is required by the claim. Value of Filesystem is implied when not
   * included in claim spec.
   */
  volumeMode?: string;

  /**
   * A description of the persistent volume\'s resources and capacity.
   *
   * More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#capacity
   */
  capacity?: Partial<Record<string, string>>;
  flexVolume?: {
    driver: string; // ceph.rook.io/rook-ceph-system,
    options: {
      clusterNamespace: string; // rook-ceph,
      image: string; // pvc-c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
      pool: string; // replicapool,
      storageClass: string; // rook-ceph-block
    };
  };
  mountOptions?: string[];
  claimRef?: ObjectReference;
  persistentVolumeReclaimPolicy?: string; // Delete,
  nfs?: {
    path: string;
    server: string;
  };
}

export interface PersistentVolumeStatus {
  phase: string;
  reason?: string;
}

export class PersistentVolume extends KubeObject<PersistentVolumeStatus, PersistentVolumeSpec, "cluster-scoped"> {
  static kind = "PersistentVolume";
  static namespaced = false;
  static apiBase = "/api/v1/persistentvolumes";

  getCapacity(inBytes = false) {
    const capacity = this.spec.capacity;

    if (capacity?.storage) {
      if (inBytes) return unitsToBytes(capacity.storage);

      return capacity.storage;
    }

    return 0;
  }

  getStatus() {
    return this.status?.phase || "-";
  }

  getStorageClass(): string {
    return this.spec.storageClassName ?? "";
  }

  getClaimRefName(): string {
    return this.spec.claimRef?.name ?? "";
  }

  getStorageClassName() {
    return this.spec.storageClassName || "";
  }
}

export class PersistentVolumeApi extends KubeApi<PersistentVolume> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: PersistentVolume,
    });
  }
}

export const persistentVolumeApi = isClusterPageContext()
  ? new PersistentVolumeApi()
  : undefined as never;
