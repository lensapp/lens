/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import deploymentsStoreInjectable from "../../../+workloads-deployments/store.injectable";
import navigateToDeploymentsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";
import { computed } from "mobx";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const deploymentsWorkloadInjectable = getInjectable({
  id: "deployments-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToDeploymentsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(deploymentsStoreInjectable);

    return {
      resource: {
        apiName: "deployments",
        group: "apps",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),

      title: ResourceNames.deployments,
      orderNumber: 20,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default deploymentsWorkloadInjectable;
