/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import computeStatusesOfObjectsBasedOnOwnedPodsInjectable from "../../utils/compute-status-counts.injectable";
import daemonSetStoreInjectable from "./store.injectable";

const totalStatusesForDaemonSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-statuses-for-daemon-sets-in-selected-namespaces",
  instantiate: (di) => {
    const daemonSetStore = di.inject(daemonSetStoreInjectable);
    const computeStatusesOfObjectsBasedOnOwnedPods = di.inject(computeStatusesOfObjectsBasedOnOwnedPodsInjectable);

    return computed(() => computeStatusesOfObjectsBasedOnOwnedPods(daemonSetStore.contextItems));
  },
});

export default totalStatusesForDaemonSetsInSelectedNamespacesInjectable;
