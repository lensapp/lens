/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { Job } from "../../../common/k8s-api/endpoints/job.api";
import { jobApi } from "../../../common/k8s-api/endpoints/job.api";
import type { CronJob, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatus } from "../../../common/k8s-api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";

export class JobStore extends KubeObjectStore<Job> {
  api = jobApi;

  constructor() {
    super();
    autoBind(this);
  }

  getChildPods(job: Job): Pod[] {
    return podsStore.getPodsByOwnerId(job.getId());
  }

  getJobsByOwner(cronJob: CronJob) {
    return this.items.filter(job =>
      job.getNs() == cronJob.getNs() &&
      job.getOwnerRefs().find(ref => ref.name === cronJob.getName() && ref.kind === cronJob.kind),
    );
  }

  getStatuses(jobs?: Job[]) {
    const status = { succeeded: 0, running: 0, failed: 0, pending: 0 };

    jobs.forEach(job => {
      const pods = this.getChildPods(job);

      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.RUNNING)) {
        status.running++;
      }
      else {
        status.succeeded++;
      }
    });

    return status;
  }
}

export const jobStore = new JobStore();
apiManager.registerStore(jobStore);
