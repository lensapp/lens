/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PodStatusPhase } from "../../common/k8s-api/endpoints";
import { getOrInsert } from "../../common/utils";
import { foldPodStatusPhase } from "./fold-pod-status-phase";
import { getInjectable } from "@ogre-tools/injectable";
import podStoreInjectable from "../components/+workloads-pods/store.injectable";
import { computed } from "mobx";
import type { KubeObject } from "../../common/k8s-api/kube-object";

export interface StatusCounts {
  running: number;
  failed: number;
  pending: number;
}

const computeStatusCountsForOwnersInjectable = getInjectable({
  id: "compute-status-counts-for-owners",
  instantiate: (di) => {
    const podStore = di.inject(podStoreInjectable);

    const podsByOwnerId = computed(() => {
      const podsByOwnerId = new Map<string, ({ status: PodStatusPhase })[]>();

      for (const pod of podStore.contextItems) {
        for (const ownerRef of pod.getOwnerRefs()) {
          getOrInsert(podsByOwnerId, ownerRef.uid, []).push({
            status: pod.getStatus(),
          });
        }
      }

      return podsByOwnerId;
    });

    return (possibleOwners: KubeObject[]): StatusCounts => {
      const statuses = { running: 0, failed: 0, pending: 0 };

      for (const possibleOwner of possibleOwners) {
        const status = (podsByOwnerId.get().get(possibleOwner.getId()) ?? [])
          .map(pod => pod.status)
          .reduce(foldPodStatusPhase, "running");

        statuses[status]++;
      }

      return statuses;
    };
  },
});

export default computeStatusCountsForOwnersInjectable;

