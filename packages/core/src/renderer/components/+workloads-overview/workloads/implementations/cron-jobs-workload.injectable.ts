/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToCronJobsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/navigate-to-cron-jobs.injectable";
import cronJobsStoreInjectable from "../../../+workloads-cronjobs/store.injectable";
import { computed } from "mobx";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../../cluster-frame-context/for-namespaced-resources.injectable";

const cronJobsWorkloadInjectable = getInjectable({
  id: "cron-jobs-workload",

  instantiate: (di) => {
    const navigate = di.inject(navigateToCronJobsInjectable);
    const context = di.inject(clusterFrameContextForNamespacedResourcesInjectable);
    const store = di.inject(cronJobsStoreInjectable);

    return {
      resource: {
        apiName: "cronjobs",
        group: "batch",
      },
      open: navigate,
      amountOfItems: computed(
        () => store.getAllByNs(context.contextNamespaces).length,
      ),
      status: computed(() =>
        store.getStatuses(store.getAllByNs(context.contextNamespaces)),
      ),
      title: ResourceNames.cronjobs,
      orderNumber: 70,
    };
  },

  injectionToken: workloadInjectionToken,
});

export default cronJobsWorkloadInjectable;
