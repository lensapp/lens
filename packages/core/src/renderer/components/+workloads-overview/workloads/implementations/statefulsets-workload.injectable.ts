/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import statefulsetsStoreInjectable from "../../../+workloads-statefulsets/store.injectable";
import { computed } from "mobx";
import navigateToStatefulsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const statefulsetsWorkloadInjectable = getInjectable({
  id: "statefulsets-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToStatefulsetsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(statefulsetsStoreInjectable);

    return {
      resource: {
        apiName: "statefulsets",
        group: "apps",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),

      title: ResourceNames.statefulsets,
      orderNumber: 40,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default statefulsetsWorkloadInjectable;
