/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import computeStatusesOfObjectsBasedOnOwnedPodsInjectable from "../../utils/compute-status-counts.injectable";
import replicaSetStoreInjectable from "./store.injectable";

const statusCountsForAllReplicaSetsInSelectedNamespacesInjectable = getInjectable({
  id: "status-counts-for-all-replica-sets-in-selected-namespaces",
  instantiate: (di) => {
    const replicaSetStore = di.inject(replicaSetStoreInjectable);
    const computeStatusesOfObjectsBasedOnOwnedPods = di.inject(computeStatusesOfObjectsBasedOnOwnedPodsInjectable);

    return computed(() => computeStatusesOfObjectsBasedOnOwnedPods(replicaSetStore.contextItems));
  },
});

export default statusCountsForAllReplicaSetsInSelectedNamespacesInjectable;
