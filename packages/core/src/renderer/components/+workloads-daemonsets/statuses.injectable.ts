/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import computeStatusCountsForOwnersInjectable from "../../utils/compute-status-counts.injectable";
import daemonSetStoreInjectable from "./store.injectable";

const totalStatusesForDaemonSetsInSelectedNamespacesInjectable = getInjectable({
  id: "total-statuses-for-daemon-sets-in-selected-namespaces",
  instantiate: (di) => {
    const daemonSetStore = di.inject(daemonSetStoreInjectable);
    const computeStatusCountsForOwners = di.inject(computeStatusCountsForOwnersInjectable);

    return computed(() => computeStatusCountsForOwners(daemonSetStore.contextItems));
  },
});

export default totalStatusesForDaemonSetsInSelectedNamespacesInjectable;
