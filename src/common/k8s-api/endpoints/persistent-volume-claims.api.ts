/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject, LabelSelector } from "../kube-object";
import { autoBind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import type { Pod } from "./pod.api";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export function getMetricsForPvc(pvc: PersistentVolumeClaim): Promise<IPvcMetrics> {
  const opts = { category: "pvc", pvc: pvc.getName(), namespace: pvc.getNs() };

  return metricsApi.getMetrics({
    diskUsage: opts,
    diskCapacity: opts,
  }, {
    namespace: opts.namespace,
  });
}

export interface IPvcMetrics<T = IMetrics> {
  [key: string]: T;
  diskUsage: T;
  diskCapacity: T;
}

export interface PersistentVolumeClaim {
  spec: {
    accessModes: string[];
    storageClassName: string;
    selector: LabelSelector;
    resources: {
      requests: {
        storage: string; // 8Gi
      };
    };
  };
  status: {
    phase: string; // Pending
  };
}

export class PersistentVolumeClaim extends KubeObject {
  static kind = "PersistentVolumeClaim";
  static namespaced = true;
  static apiBase = "/api/v1/persistentvolumeclaims";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getPods(allPods: Pod[]): Pod[] {
    const pods = allPods.filter(pod => pod.getNs() === this.getNs());

    return pods.filter(pod => {
      return pod.getVolumes().filter(volume =>
        volume.persistentVolumeClaim &&
        volume.persistentVolumeClaim.claimName === this.getName(),
      ).length > 0;
    });
  }

  getStorage(): string {
    if (!this.spec.resources || !this.spec.resources.requests) return "-";

    return this.spec.resources.requests.storage;
  }

  getMatchLabels(): string[] {
    if (!this.spec.selector || !this.spec.selector.matchLabels) return [];

    return Object.entries(this.spec.selector.matchLabels)
      .map(([name, val]) => `${name}:${val}`);
  }

  getMatchExpressions() {
    if (!this.spec.selector || !this.spec.selector.matchExpressions) return [];

    return this.spec.selector.matchExpressions;
  }

  getStatus(): string {
    if (this.status) return this.status.phase;

    return "-";
  }
}

export class PersistentVolumeClaimApi extends KubeApi<PersistentVolumeClaim> {
  constructor(args: SpecificApiOptions<PersistentVolumeClaim> = {}) {
    super({
      ...args,
      objectConstructor: PersistentVolumeClaim,
    });
  }
}
