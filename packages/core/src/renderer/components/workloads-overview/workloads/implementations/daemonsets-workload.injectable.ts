/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import namespaceStoreInjectable from "../../../namespaces/store.injectable";
import daemonsetsStoreInjectable from "../../../workloads-daemonsets/store.injectable";
import navigateToDaemonsetsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/daemonsets/navigate-to-daemonsets.injectable";
import { computed } from "mobx";

const daemonsetsWorkloadInjectable = getInjectable({
  id: "daemonsets-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToDaemonsetsInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const store = di.inject(daemonsetsStoreInjectable);

    return {
      resource: {
        apiName: "daemonsets",
        group: "apps",
      },
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(namespaceStore.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(namespaceStore.contextNamespaces)),
      ),

      title: ResourceNames.daemonsets,
      orderNumber: 30,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default daemonsetsWorkloadInjectable;
