/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import statusesOfReplicaSetsByOwnerIdsInSelectedNamespacesInjectable from "../+workloads-replicasets/statuses-by-owner-id.injectable";
import deploymentStoreInjectable from "./store.injectable";

const statusCountsForAllDeploymentsInSelectedNamespacesInjectable = getInjectable({
  id: "status-counts-for-all-deployments-in-selected-namespaces",
  instantiate: (di) => {
    const deploymentStore = di.inject(deploymentStoreInjectable);
    const replicaSetStatuses = di.inject(statusesOfReplicaSetsByOwnerIdsInSelectedNamespacesInjectable);

    return computed(() => new Map(deploymentStore.contextItems.map(deployment => [
      deployment.getId(),
      replicaSetStatuses.get().get(deployment.getId()) ?? [],
    ])));
  },
});

export default statusCountsForAllDeploymentsInSelectedNamespacesInjectable;

