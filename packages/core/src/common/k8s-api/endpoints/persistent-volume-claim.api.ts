/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, NamespaceScopedMetadata, TypedLocalObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { Pod } from "./pod.api";
import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { object } from "../../utils";
import type { ResourceRequirements } from "./types/resource-requirements";

export class PersistentVolumeClaimApi extends KubeApi<PersistentVolumeClaim> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: PersistentVolumeClaim,
    });
  }
}

export interface PersistentVolumeClaimSpec {
  accessModes?: string[];
  dataSource?: TypedLocalObjectReference;
  dataSourceRef?: TypedLocalObjectReference;
  resources?: ResourceRequirements;
  selector?: LabelSelector;
  storageClassName?: string;
  volumeMode?: string;
  volumeName?: string;
}

export interface PersistentVolumeClaimStatus {
  phase: string; // Pending
}

export class PersistentVolumeClaim extends KubeObject<
  NamespaceScopedMetadata,
  PersistentVolumeClaimStatus,
  PersistentVolumeClaimSpec
> {
  static readonly kind = "PersistentVolumeClaim";
  static readonly namespaced = true;
  static readonly apiBase = "/api/v1/persistentvolumeclaims";

  getPods(pods: Pod[]): Pod[] {
    return pods
      .filter(pod => pod.getNs() === this.getNs())
      .filter(pod => (
        pod.getVolumes()
          .filter(volume => volume.persistentVolumeClaim?.claimName === this.getName())
          .length > 0
      ));
  }

  getStorage(): string {
    return this.spec.resources?.requests?.storage ?? "-";
  }

  getMatchLabels(): string[] {
    return object.entries(this.spec.selector?.matchLabels)
      .map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions() {
    return this.spec.selector?.matchExpressions ?? [];
  }

  getStatus(): string {
    return this.status?.phase ?? "-";
  }
}
