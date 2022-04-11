/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetPodsByOwnerId } from "../+workloads-pods/get-pods-by-owner-id.injectable";
import type { Deployment, ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints/pod.api";
import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";

export interface ReplicaSetStoreDependencies {
  getPodsByOwnerId: GetPodsByOwnerId;
}

export class ReplicaSetStore extends KubeObjectStore<ReplicaSet, ReplicaSetApi> {
  constructor(protected readonly dependencies: ReplicaSetStoreDependencies, api: ReplicaSetApi, opts?: KubeObjectStoreOptions) {
    super(api, opts);
  }

  getChildPods(replicaSet: ReplicaSet) {
    return this.dependencies.getPodsByOwnerId(replicaSet.getId());
  }

  getStatuses(replicaSets: ReplicaSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    for (const replicaSet of replicaSets) {
      const statuses = new Set(this.getChildPods(replicaSet).map(pod => pod.getStatus()));

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

  getReplicaSetsByOwner(deployment: Deployment) {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId()),
    );
  }
}
