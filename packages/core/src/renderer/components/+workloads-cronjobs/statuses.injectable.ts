/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import cronJobStoreInjectable from "./store.injectable";

const totalStatusesForCronJobsInSelectedNamespacesInjectable = getInjectable({
  id: "total-statuses-for-cron-jobs-in-selected-namespaces",
  instantiate: (di) => {
    const cronJobStore = di.inject(cronJobStoreInjectable);

    return computed(() => new Map(cronJobStore.contextItems.map(cronJob => [
      cronJob.getId(),
      [cronJob.getStatus()],
    ])));
  },
});

export default totalStatusesForCronJobsInSelectedNamespacesInjectable;
