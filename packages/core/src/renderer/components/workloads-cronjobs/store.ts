/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStoreDependencies, KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { CronJob } from "@k8slens/kube-object";
import type { GetJobsByOwner } from "../workloads-jobs/get-jobs-by-owner.injectable";
import type { CronJobApi } from "../../../common/k8s-api/endpoints";

interface Dependencies extends KubeObjectStoreDependencies {
  getJobsByOwner: GetJobsByOwner;
}

export class CronJobStore extends KubeObjectStore<CronJob, CronJobApi> {
  constructor(protected readonly dependencies: Dependencies, api: CronJobApi, opts?: KubeObjectStoreOptions) {
    super(dependencies, api, opts);
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
