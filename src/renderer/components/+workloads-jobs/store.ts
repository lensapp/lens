/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectStoreOptions } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Job, JobApi } from "../../../common/k8s-api/endpoints/job.api";
import type { CronJob, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import type { GetPodsByOwnerId } from "../+workloads-pods/get-pods-by-owner-id.injectable";

interface Dependencies {
  getPodsByOwnerId: GetPodsByOwnerId;
}

export class JobStore extends KubeObjectStore<Job, JobApi> {
  constructor(protected readonly dependencies: Dependencies, api: JobApi, opts?: KubeObjectStoreOptions) {
    super(api, opts);
  }

  getChildPods(job: Job): Pod[] {
    return this.dependencies.getPodsByOwnerId(job.getId());
  }

  getJobsByOwner(cronJob: CronJob) {
    return this.items.filter(job =>
      job.getNs() == cronJob.getNs() &&
      job.getOwnerRefs().find(ref => ref.name === cronJob.getName() && ref.kind === cronJob.kind),
    );
  }

  getStatuses(jobs?: Job[]) {
    const status = { succeeded: 0, running: 0, failed: 0, pending: 0 };

    for (const job of jobs ?? []) {
      const statuses = new Set(this.getChildPods(job).map(pod => pod.getStatus()));

      if (statuses.has(PodStatusPhase.FAILED)) {
        status.failed++;
      } else if (statuses.has(PodStatusPhase.PENDING)) {
        status.pending++;
      } else if (statuses.has(PodStatusPhase.RUNNING)) {
        status.running++;
      } else {
        status.succeeded++;
      }
    }

    return status;
  }
}
