/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LabelSelector, TypedLocalObjectReference } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { MetricData } from "./metrics.api";
import { metricsApi } from "./metrics.api";
import type { Pod } from "./pods.api";
import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";
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

export function getMetricsForPvc(pvc: PersistentVolumeClaim): Promise<PersistentVolumeClaimMetricData> {
  const opts = { category: "pvc", pvc: pvc.getName(), namespace: pvc.getNs() };

  return metricsApi.getMetrics({
    diskUsage: opts,
    diskCapacity: opts,
  }, {
    namespace: opts.namespace,
  });
}

export interface PersistentVolumeClaimMetricData extends Partial<Record<string, MetricData>> {
  diskUsage: MetricData;
  diskCapacity: MetricData;
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

export class PersistentVolumeClaim extends KubeObject<PersistentVolumeClaimStatus, PersistentVolumeClaimSpec, "namespace-scoped"> {
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

export const persistentVolumeClaimApi = isClusterPageContext()
  ? new PersistentVolumeClaimApi()
  : undefined as never;
