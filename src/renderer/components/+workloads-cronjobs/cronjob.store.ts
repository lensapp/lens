/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { CronJob, CronJobApi } from "../../../common/k8s-api/endpoints/cron-job.api";
import { cronJobApi } from "../../../common/k8s-api/endpoints/cron-job.api";
import { jobStore } from "../+workloads-jobs/job.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class CronJobStore extends KubeObjectStore<CronJob, CronJobApi> {
  getStatuses(cronJobs?: CronJob[]) {
    const status = { scheduled: 0, suspended: 0 };

    cronJobs?.forEach(cronJob => {
      if (cronJob.spec.suspend) {
        status.suspended++;
      }
      else {
        status.scheduled++;
      }
    });

    return status;
  }

  getActiveJobsNum(cronJob: CronJob) {
    // Active jobs are jobs without any condition 'Complete' nor 'Failed'
    const jobs = jobStore.getJobsByOwner(cronJob);

    if (!jobs.length) return 0;

    return jobs.filter(job => !job.getCondition()).length;
  }
}

export const cronJobStore = isClusterPageContext()
  ? new CronJobStore(cronJobApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(cronJobStore);
}
