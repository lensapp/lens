/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import namespaceStoreInjectable from "../../../+namespaces/store.injectable";
import statefulsetsStoreInjectable from "../../../+workloads-statefulsets/store.injectable";
import { computed } from "mobx";
import navigateToStatefulsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";

const statefulsetsWorkloadInjectable = getInjectable({
  id: "statefulsets-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToStatefulsetsInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const store = di.inject(statefulsetsStoreInjectable);

    return {
      resourceName: "statefulsets",
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(namespaceStore.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(namespaceStore.contextNamespaces)),
      ),

      title: ResourceNames.statefulsets,
      orderNumber: 40,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default statefulsetsWorkloadInjectable;
