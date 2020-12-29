import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { CronJob } from "../../api/endpoints/cron-job.api";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { cronJobStore } from "./cronjob.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { ICronJobsRouteParams } from "../+workloads";
import { KubeObjectListLayout } from "../kube-object";
import { CronJobTriggerDialog } from "./cronjob-trigger-dialog";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  suspend = "suspend",
  active = "active",
  lastSchedule = "schedule",
  age = "age",
}

interface Props extends RouteComponentProps<ICronJobsRouteParams> {
}

@observer
export class CronJobs extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="CronJobs" store={cronJobStore}
        dependentStores={[jobStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (cronJob: CronJob) => cronJob.getName(),
          [sortBy.namespace]: (cronJob: CronJob) => cronJob.getNs(),
          [sortBy.suspend]: (cronJob: CronJob) => cronJob.getSuspendFlag(),
          [sortBy.active]: (cronJob: CronJob) => cronJobStore.getActiveJobsNum(cronJob),
          [sortBy.lastSchedule]: (cronJob: CronJob) => cronJob.getLastScheduleTime(),
          [sortBy.age]: (cronJob: CronJob) => cronJob.metadata.creationTimestamp,
        }}
        searchFilters={[
          (cronJob: CronJob) => cronJob.getSearchFields(),
          (cronJob: CronJob) => cronJob.getSchedule(),
        ]}
        renderHeaderTitle="Cron Jobs"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Schedule", className: "schedule" },
          { title: "Suspend", className: "suspend", sortBy: sortBy.suspend },
          { title: "Active", className: "active", sortBy: sortBy.active },
          { title: "Last schedule", className: "last-schedule", sortBy: sortBy.lastSchedule },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(cronJob: CronJob) => [
          cronJob.getName(),
          <KubeObjectStatusIcon key="icon" object={cronJob} />,
          cronJob.getNs(),
          cronJob.isNeverRun() ? "never"  : cronJob.getSchedule(),
          cronJob.getSuspendFlag(),
          cronJobStore.getActiveJobsNum(cronJob),
          cronJob.getLastScheduleTime(),
          cronJob.getAge(),
        ]}
        renderItemMenu={(item: CronJob) => {
          return <CronJobMenu object={item}/>;
        }}
      />
    );
  }
}

export function CronJobMenu(props: KubeObjectMenuProps<CronJob>) {
  const { object, toolbar } = props;

  return (
    <MenuItem onClick={() => CronJobTriggerDialog.open(object)}>
      <Icon material="play_circle_filled" title={`Trigger`} interactive={toolbar}/>
      <span className="title">Trigger</span>
    </MenuItem>
  );
}

kubeObjectMenuRegistry.add({
  kind: "CronJob",
  apiVersions: ["batch/v1beta1"],
  components: {
    MenuItem: CronJobMenu
  }
});
