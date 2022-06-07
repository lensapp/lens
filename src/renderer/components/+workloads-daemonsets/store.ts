/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetPodsByOwnerId } from "../+workloads-pods/get-pods-by-owner-id.injectable";
import type { DaemonSet, DaemonSetApi, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export interface DaemonSetStoreDependencies {
  readonly getPodsByOwnerId: GetPodsByOwnerId;
}

export class DaemonSetStore extends KubeObjectStore<DaemonSet, DaemonSetApi> {
  constructor(protected readonly dependencies: DaemonSetStoreDependencies, api: DaemonSetApi, opts?: KubeObjectStoreOptions) {
    super(api, opts);
  }

  getChildPods(daemonSet: DaemonSet): Pod[] {
    return this.dependencies.getPodsByOwnerId(daemonSet.getId());
  }

  getStatuses(daemonSets?: DaemonSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    for (const daemonSet of daemonSets ?? []) {
      const statuses = new Set(this.getChildPods(daemonSet).map(pod => pod.getStatus()));

      if (statuses.has(PodStatusPhase.FAILED)) {
        status.failed++;
      } else if (statuses.has(PodStatusPhase.PENDING)) {
        status.pending++;
      } else {
        status.running++;
      }
    }

    return status;
  }
}
