/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { StatefulSet, StatefulSetApi } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase, statefulSetApi } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../utils";

export class StatefulSetStore extends KubeObjectStore<StatefulSet, StatefulSetApi> {
  getChildPods(statefulSet: StatefulSet) {
    return podsStore.getPodsByOwnerId(statefulSet.getId());
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

export const statefulSetStore = isClusterPageContext()
  ? new StatefulSetStore(statefulSetApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(statefulSetStore);
}
