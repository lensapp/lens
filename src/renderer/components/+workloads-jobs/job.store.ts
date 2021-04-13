import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { Job, jobApi, getMetricsForJobs } from "../../api/endpoints/job.api";
import { CronJob, IPodMetrics, Pod, PodStatus } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "../../api/api-manager";
import { observable } from "mobx";

@autobind()
export class JobStore extends KubeObjectStore<Job> {
  api = jobApi;

  @observable metrics: IPodMetrics = null;

  async loadMetrics(job: Job) {
    this.metrics = await getMetricsForJobs([job], job.getNs(), "");
  }

  getChildPods(job: Job): Pod[] {
    return podsStore.getPodsByOwnerId(job.getId());
  }

  getJobsByOwner(cronJob: CronJob) {
    return this.items.filter(job =>
      job.getNs() == cronJob.getNs() &&
      job.getOwnerRefs().find(ref => ref.name === cronJob.getName() && ref.kind === cronJob.kind)
    );
  }

  getStatuses(jobs?: Job[]) {
    const status = { failed: 0, pending: 0, running: 0, succeeded: 0 };

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
