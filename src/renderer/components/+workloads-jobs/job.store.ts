/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Job, JobApi } from "../../../common/k8s-api/endpoints/job.api";
import { jobApi } from "../../../common/k8s-api/endpoints/job.api";
import type { CronJob, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatusPhase } from "../../../common/k8s-api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { isClusterPageContext } from "../../utils";

export class JobStore extends KubeObjectStore<Job, JobApi> {
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

export const jobStore = isClusterPageContext()
  ? new JobStore(jobApi)
  : undefined as never;

if (isClusterPageContext()) {
  apiManager.registerStore(jobStore);
}
