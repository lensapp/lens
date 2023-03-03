/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import daemonsetsStoreInjectable from "../../../+workloads-daemonsets/store.injectable";
import navigateToDaemonsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/daemonsets/navigate-to-daemonsets.injectable";
import { computed } from "mobx";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const daemonsetsWorkloadInjectable = getInjectable({
  id: "daemonsets-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToDaemonsetsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(daemonsetsStoreInjectable);

    return {
      resource: {
        apiName: "daemonsets",
        group: "apps",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),

      title: ResourceNames.daemonsets,
      orderNumber: 30,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default daemonsetsWorkloadInjectable;
