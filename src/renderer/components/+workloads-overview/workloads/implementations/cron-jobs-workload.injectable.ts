/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToPodsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";
import namespaceStoreInjectable from "../../../+namespaces/namespace-store/namespace-store.injectable";
import cronJobsStoreInjectable from "../../../+workloads-cronjobs/store.injectable";
import { computed } from "mobx";

const cronJobsWorkloadInjectable = getInjectable({
  id: "cron-jobs-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToPodsInjectable);
    const namespaceStore = di.inject(namespaceStoreInjectable);
    const store = di.inject(cronJobsStoreInjectable);

    return {
      resourceName: "cronjobs",
      open: navigate,

      amountOfItems: computed(
        () => store.getAllByNs(namespaceStore.contextNamespaces).length,
      ),

      status: computed(() =>
        store.getStatuses(store.getAllByNs(namespaceStore.contextNamespaces)),
      ),

      title: ResourceNames.cronjobs,
      orderNumber: 70,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default cronJobsWorkloadInjectable;
