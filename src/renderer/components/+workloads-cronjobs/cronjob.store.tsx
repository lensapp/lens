import React from "react";
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { CronJob, cronJobApi } from "../../api/endpoints/cron-job.api";
import { jobStore } from "../+workloads-jobs/job.store";
import { apiManager } from "../../api/api-manager";
import { addLensKubeObjectMenuItem } from "../../../extensions/registries";
import { PauseCircleFilled, PlayCircleFilled, PlayCircleOutline, Remove, Update } from "@material-ui/icons";
import { CronJobTriggerDialog } from "./cronjob-trigger-dialog";
import { Notifications } from "../notifications";
import { editResourceTab } from "../dock/edit-resource.store";

@autobind()
export class CronJobStore extends KubeObjectStore<CronJob> {
  api = cronJobApi;

  getStatuses(cronJobs?: CronJob[]) {
    const status = { suspended: 0, scheduled: 0 };

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
    const jobs = jobStore.getJobsByOwner(cronJob);

    if (!jobs.length) return 0;

    return jobs.filter(job => !job.getCondition()).length;
  }
}

export const cronJobStore = new CronJobStore();
apiManager.registerStore(cronJobStore);

addLensKubeObjectMenuItem({
  Object: CronJob,
  Icon: Remove,
  onClick: sa => cronJobStore.remove(sa),
  text: "Delete",
});

addLensKubeObjectMenuItem({
  Object: CronJob,
  Icon: Update,
  onClick: editResourceTab,
  text: "Update",
});

addLensKubeObjectMenuItem({
  Object: CronJob,
  apiVersions: ["batch/v1beta1"],
  Icon: PlayCircleFilled,
  text: "Trigger",
  onClick: CronJobTriggerDialog.open,
});

addLensKubeObjectMenuItem({
  Object: CronJob,
  apiVersions: ["batch/v1beta1"],
  Icon: PlayCircleOutline,
  text: "Resume",
  when: object => object.isSuspend(),
  onClick: object => (
    cronJobApi.resume({ namespace: object.getNs(), name: object.getName() })
      .catch(Notifications.error)
  ),
  confirmation: {
    Message: ({ object }) => (
      <p>
        Resume CronJob<b>{ object.getName() }</b>?
      </p>
    ),
  },
});

addLensKubeObjectMenuItem({
  Object: CronJob,
  apiVersions: ["batch/v1beta1"],
  Icon: PauseCircleFilled,
  text: "Suspend",
  when: object => !object.isSuspend(),
  onClick: object => (
    cronJobApi.suspend({ namespace: object.getNs(), name: object.getName() })
      .catch(Notifications.error)
  ),
  confirmation: {
    Message: ({ object }) => (
      <p>
        Suspend CronJob<b>{ object.getName() }</b>?
      </p>
    ),
  },
});
