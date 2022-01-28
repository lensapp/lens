/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { Job, JobApi } from "../../../common/k8s-api/endpoints/job.api";
import { CronJob, Pod, PodStatus } from "../../../common/k8s-api/endpoints";
import type { PodStore } from "../+pods/store";

export interface JobStoreDependencies {
  podStore: PodStore;
}

export class JobStore extends KubeObjectStore<Job> {
  constructor(public readonly api:JobApi, protected dependencies: JobStoreDependencies) {
    super();
    autoBind(this);
  }

  getChildPods(job: Job): Pod[] {
    return this.dependencies.podStore.getPodsByOwnerId(job.getId());
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
