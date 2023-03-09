/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import computeStatusesOfObjectsBasedOnOwnedPodsInjectable from "../../utils/compute-status-counts.injectable";
import jobStoreInjectable from "./store.injectable";

const statusCountsForAllJobsInSelectedNamespacesInjectable = getInjectable({
  id: "status-counts-for-all-jobs-in-selected-namespaces",
  instantiate: (di) => {
    const jobStore = di.inject(jobStoreInjectable);
    const computeStatusesOfObjectsBasedOnOwnedPods = di.inject(computeStatusesOfObjectsBasedOnOwnedPodsInjectable);

    return computed(() => computeStatusesOfObjectsBasedOnOwnedPods(jobStore.contextItems));
  },
});

export default statusCountsForAllJobsInSelectedNamespacesInjectable;

