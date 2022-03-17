/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import type { DaemonSet, DaemonSetApi, Pod } from "../../../common/k8s-api/endpoints";
import { daemonSetApi, PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { isClusterPageContext } from "../../utils";

export class DaemonSetStore extends KubeObjectStore<DaemonSet, DaemonSetApi> {
  getChildPods(daemonSet: DaemonSet): Pod[] {
    return podsStore.getPodsByOwnerId(daemonSet.getId());
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

export const daemonSetStore = isClusterPageContext()
  ? new DaemonSetStore(daemonSetApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(daemonSetStore);
}
