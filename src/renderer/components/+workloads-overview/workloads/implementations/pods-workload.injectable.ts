/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToPodsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";
import podsStoreInjectable from "../../../+workloads-pods/pods-store.injectable";
import namespaceStoreInjectable from "../../../+namespaces/namespace-store/namespace-store.injectable";
import { computed } from "mobx";

const podsWorkloadInjectable = getInjectable({
  id: "pods-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToPodsInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const store = di.inject(podsStoreInjectable);

    return {
      resourceName: "pods",
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(namespaceStore.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(namespaceStore.contextNamespaces)),
      ),

      title: ResourceNames.pods,
      orderNumber: 10,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default podsWorkloadInjectable;
