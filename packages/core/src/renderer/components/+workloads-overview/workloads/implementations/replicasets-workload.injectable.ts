/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import replicasetsStoreInjectable from "../../../+workloads-replicasets/store.injectable";
import { computed } from "mobx";
import navigateToReplicasetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/replicasets/navigate-to-replicasets.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const replicasetsWorkloadInjectable = getInjectable({
  id: "replicasets-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToReplicasetsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(replicasetsStoreInjectable);

    return {
      resource: {
        apiName: "replicasets",
        group: "apps",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),

      title: ResourceNames.replicasets,
      orderNumber: 50,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default replicasetsWorkloadInjectable;
