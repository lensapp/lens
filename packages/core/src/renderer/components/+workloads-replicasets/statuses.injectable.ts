/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { getOrInsert } from "../../utils";
import { foldPodStatusPhase } from "../../utils/fold-pod-status-phase";
import replicaSetStoreInjectable from "./store.injectable";

interface PodData {
  status: PodStatusPhase;
}

const statusCountsForAllReplicaSetsInSelectedNamespacesInjectable = getInjectable({
  id: "status-counts-for-all-replica-sets-in-selected-namespaces",
  instantiate: (di) => {
    const podStore = di.inject(podStoreInjectable);
    const replicaSetStore = di.inject(replicaSetStoreInjectable);

    return computed(() => {
      const podsByOwnerId = new Map<string, PodData[]>();
      const statuses = { running: 0, failed: 0, pending: 0 };

      for (const pod of podStore.contextItems) {
        for (const ownerRef of pod.getOwnerRefs()) {
          getOrInsert(podsByOwnerId, ownerRef.uid, []).push({
            status: pod.getStatus(),
          });
        }
      }

      for (const replicaSet of replicaSetStore.contextItems) {
        const status = (podsByOwnerId.get(replicaSet.getId()) ?? [])
          .map(pod => pod.status)
          .reduce(foldPodStatusPhase, "running");

        statuses[status]++;
      }

      return statuses;
    });
  },
});

export default statusCountsForAllReplicaSetsInSelectedNamespacesInjectable;
