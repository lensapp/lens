/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { CronJob, CronJobApi } from "../../../common/k8s-api/endpoints/cron-job.api";
import type { GetJobsByOwner } from "../+workloads-jobs/get-jobs-by-owner.injectable";

interface Dependencies {
  getJobsByOwner: GetJobsByOwner;
}

export class CronJobStore extends KubeObjectStore<CronJob, CronJobApi> {
  constructor(protected readonly dependencies: Dependencies, api: CronJobApi, opts?: KubeObjectStoreOptions) {
    super(api, opts);
  }

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
    const jobs = this.dependencies.getJobsByOwner(cronJob);

    if (!jobs.length) return 0;

    return jobs.filter(job => !job.getCondition()).length;
  }
}
