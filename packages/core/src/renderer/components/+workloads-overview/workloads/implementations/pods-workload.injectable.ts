/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToPodsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";
import { computed } from "mobx";
import podStoreInjectable from "../../../+workloads-pods/store.injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const podsWorkloadInjectable = getInjectable({
  id: "pods-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToPodsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(podStoreInjectable);

    return {
      resource: {
        apiName: "pods",
        group: "",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),

      title: ResourceNames.pods,
      orderNumber: 10,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default podsWorkloadInjectable;
