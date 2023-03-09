/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToCronJobsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/cron-jobs/navigate-to-cron-jobs.injectable";
import totalCountOfCronJobsInSelectedNamespacesInjectable from "../../../+workloads-cronjobs/total-count.injectable";
import totalStatusesForCronJobsInSelectedNamespacesInjectable from "../../../+workloads-cronjobs/statuses.injectable";

const cronJobsWorkloadInjectable = getInjectable({
  id: "cron-jobs-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "cronjobs",
      group: "batch",
    },
    open: di.inject(navigateToCronJobsInjectable),
    amountOfItems: di.inject(totalCountOfCronJobsInSelectedNamespacesInjectable),
    status: di.inject(totalStatusesForCronJobsInSelectedNamespacesInjectable),
    title: ResourceNames.cronjobs,
    orderNumber: 70,
  }),

  injectionToken: workloadInjectionToken,
});

export default cronJobsWorkloadInjectable;
