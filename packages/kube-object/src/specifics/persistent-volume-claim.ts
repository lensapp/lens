/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Pod } from "./pod";
import { object } from "@k8slens/utilities";
import type { TypedLocalObjectReference, LabelSelector, NamespaceScopedMetadata } from "../api-types";
import { KubeObject } from "../kube-object";
import type { ResourceRequirements } from "../types/resource-requirements";

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
      .filter((pod) => pod.getNs() === this.getNs())
      .filter(
        (pod) =>
          pod.getVolumes().filter((volume) => volume.persistentVolumeClaim?.claimName === this.getName()).length > 0,
      );
  }

  getStorage(): string {
    return this.spec.resources?.requests?.storage ?? "-";
  }

  getMatchLabels(): string[] {
    return object.entries(this.spec.selector?.matchLabels).map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions() {
    return this.spec.selector?.matchExpressions ?? [];
  }

  getStatus(): string {
    return this.status?.phase ?? "-";
  }
}
