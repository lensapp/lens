/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { GetPodsByOwnerId } from "../workloads-pods/get-pods-by-owner-id.injectable";
import { PodStatusPhase } from "@k8slens/kube-object";
import type { Deployment, ReplicaSet } from "@k8slens/kube-object";
import type { KubeObjectStoreDependencies, KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { ReplicaSetApi } from "../../../common/k8s-api/endpoints";

export interface ReplicaSetStoreDependencies extends KubeObjectStoreDependencies {
  getPodsByOwnerId: GetPodsByOwnerId;
}

export class ReplicaSetStore extends KubeObjectStore<ReplicaSet, ReplicaSetApi> {
  constructor(protected readonly dependencies: ReplicaSetStoreDependencies, api: ReplicaSetApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
  }

  /**
   * @deprecated Switch to using `getPodsByOwnerId` directly
   */
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
