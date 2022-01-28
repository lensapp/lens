/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { CronJob, CronJobApi } from "../../../common/k8s-api/endpoints/cron-job.api";
import type { JobStore } from "../+jobs/store";

export interface CronJobStoreDependencies {
  jobStore: JobStore;
}

export class CronJobStore extends KubeObjectStore<CronJob> {
  constructor(public readonly api:CronJobApi, protected dependencies: CronJobStoreDependencies) {
    super();
    autoBind(this);
  }

  getStatuses(cronJobs?: CronJob[]) {
    const status = { scheduled: 0, suspended: 0 };

    cronJobs.forEach(cronJob => {
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
    const jobs = this.dependencies.jobStore.getJobsByOwner(cronJob);

    if (!jobs.length) return 0;

    return jobs.filter(job => !job.getCondition()).length;
  }
}
