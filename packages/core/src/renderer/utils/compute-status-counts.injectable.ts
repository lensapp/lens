/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PodStatusPhase } from "../../common/k8s-api/endpoints";
import { getOrInsert } from "../../common/utils";
import { getInjectable } from "@ogre-tools/injectable";
import podStoreInjectable from "../components/+workloads-pods/store.injectable";
import { computed } from "mobx";
import type { KubeObject } from "../../common/k8s-api/kube-object";

const computeStatusesOfObjectsBasedOnOwnedPodsInjectable = getInjectable({
  id: "compute-statuses-of-objects-based-on-owned-pods",
  instantiate: (di) => {
    const podStore = di.inject(podStoreInjectable);

    const podStatusesByOwnerId = computed(() => {
      const podsByOwnerId = new Map<string, PodStatusPhase[]>();

      for (const pod of podStore.contextItems) {
        for (const ownerRef of pod.getOwnerRefs()) {
          getOrInsert(podsByOwnerId, ownerRef.uid, []).push(pod.getStatus());
        }
      }

      return podsByOwnerId;
    });

    return (owners: KubeObject[]) => new Map(owners.map(owner => {
      const statuses = podStatusesByOwnerId.get().get(owner.getId()) ?? [];

      return [owner.getId(), statuses];
    }));
  },
});

export default computeStatusesOfObjectsBasedOnOwnedPodsInjectable;

