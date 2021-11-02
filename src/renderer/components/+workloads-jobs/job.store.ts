/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import { Job, jobApi } from "../../../common/k8s-api/endpoints/job.api";
import { CronJob, Pod, PodStatus } from "../../../common/k8s-api/endpoints";
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
