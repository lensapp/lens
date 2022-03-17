/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { Deployment, ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints";
import { replicaSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints/pods.api";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../utils";

export class ReplicaSetStore extends KubeObjectStore<ReplicaSet, ReplicaSetApi> {
  getChildPods(replicaSet: ReplicaSet) {
    return podsStore.getPodsByOwnerId(replicaSet.getId());
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

export const replicaSetStore = isClusterPageContext()
  ? new ReplicaSetStore(replicaSetApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(replicaSetStore);
}
