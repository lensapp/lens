/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { getOrInsert } from "../../utils";
import statusCountsForAllReplicaSetsInSelectedNamespacesInjectable from "./statuses.injectable";
import replicaSetStoreInjectable from "./store.injectable";

const statusesOfReplicaSetsByOwnerIdsInSelectedNamespacesInjectable = getInjectable({
  id: "statuses-of-replica-sets-by-owner-ids-in-selected-namespaces",
  instantiate: (di) => {
    const replicaSetStore = di.inject(replicaSetStoreInjectable);
    const statuses = di.inject(statusCountsForAllReplicaSetsInSelectedNamespacesInjectable);

    return computed(() => {
      const result = new Map<string, PodStatusPhase[]>();

      for (const replicaSet of replicaSetStore.contextItems) {
        for (const ownerRef of replicaSet.getOwnerRefs()) {
          getOrInsert(result, ownerRef.uid, []).push(...statuses.get().get(replicaSet.getId()) ?? []);
        }
      }

      return result;
    });
  },
});

export default statusesOfReplicaSetsByOwnerIdsInSelectedNamespacesInjectable;
