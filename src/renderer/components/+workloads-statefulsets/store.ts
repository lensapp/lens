/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetPodsByOwnerId } from "../+workloads-pods/get-pods-by-owner-id.injectable";
import type { StatefulSet, StatefulSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

interface Dependencies {
  getPodsByOwnerId: GetPodsByOwnerId;
}

export class StatefulSetStore extends KubeObjectStore<StatefulSet, StatefulSetApi> {
  constructor(protected readonly dependencies: Dependencies, api: StatefulSetApi, opts?: KubeObjectStoreOptions) {
    super(api, opts);
  }

  getChildPods(statefulSet: StatefulSet) {
    return this.dependencies.getPodsByOwnerId(statefulSet.getId());
  }

  getStatuses(statefulSets: StatefulSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    for (const statefulSet of statefulSets) {
      const statuses = new Set(this.getChildPods(statefulSet).map(pod => pod.getStatus()));

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
