/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { workloadInjectionToken } from "../workload-injection-token";
import { ResourceNames } from "../../../../utils/rbac";
import navigateToJobsInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/jobs/navigate-to-jobs.injectable";
import totalCountOfJobsInSelectedNamespacesInjectable from "../../../+workloads-jobs/total-count.injectable";
import statusCountsForAllJobsInSelectedNamespacesInjectable from "../../../+workloads-jobs/statuses.injectable";

const jobsWorkloadInjectable = getInjectable({
  id: "jobs-workload",

  instantiate: (di) => ({
    resource: {
      apiName: "jobs",
      group: "batch",
    },
    open: di.inject(navigateToJobsInjectable),
    amountOfItems: di.inject(totalCountOfJobsInSelectedNamespacesInjectable),
    status: di.inject(statusCountsForAllJobsInSelectedNamespacesInjectable),
    title: ResourceNames.jobs,
    orderNumber: 60,
  }),

  injectionToken: workloadInjectionToken,
});

export default jobsWorkloadInjectable;
