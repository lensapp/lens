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
import { autoBind } from "../../utils";
import { IMetrics, metricsApi } from "./metrics.api";
import type { Pod } from "./pods.api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export class PersistentVolumeClaimsApi extends KubeApi<PersistentVolumeClaim> {
}

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

let pvcApi: PersistentVolumeClaimsApi;

if (isClusterPageContext()) {
  pvcApi = new PersistentVolumeClaimsApi({
    objectConstructor: PersistentVolumeClaim,
  });
}

export {
  pvcApi,
};
