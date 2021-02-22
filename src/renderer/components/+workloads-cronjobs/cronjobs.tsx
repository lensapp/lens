import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { CronJob, cronJobApi } from "../../api/endpoints/cron-job.api";
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
import { ConfirmDialog } from "../confirm-dialog/confirm-dialog";
import { Notifications } from "../notifications/notifications";

enum columnId {
  name = "name",
  namespace = "namespace",
  schedule = "schedule",
  suspend = "suspend",
  active = "active",
  lastSchedule = "last-schedule",
  age = "age",
}

interface Props extends RouteComponentProps<ICronJobsRouteParams> {
}

@observer
export class CronJobs extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_cronjobs"
        className="CronJobs" store={cronJobStore}
        dependentStores={[jobStore, eventStore]}
        sortingCallbacks={{
          [columnId.name]: (cronJob: CronJob) => cronJob.getName(),
          [columnId.namespace]: (cronJob: CronJob) => cronJob.getNs(),
          [columnId.suspend]: (cronJob: CronJob) => cronJob.getSuspendFlag(),
          [columnId.active]: (cronJob: CronJob) => cronJobStore.getActiveJobsNum(cronJob),
          [columnId.lastSchedule]: (cronJob: CronJob) => cronJob.getLastScheduleTime(),
          [columnId.age]: (cronJob: CronJob) => cronJob.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (cronJob: CronJob) => cronJob.getSearchFields(),
          (cronJob: CronJob) => cronJob.getSchedule(),
        ]}
        renderHeaderTitle="Cron Jobs"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Schedule", className: "schedule", id: columnId.schedule },
          { title: "Suspend", className: "suspend", sortBy: columnId.suspend, id: columnId.suspend },
          { title: "Active", className: "active", sortBy: columnId.active, id: columnId.active },
          { title: "Last schedule", className: "last-schedule", sortBy: columnId.lastSchedule, id: columnId.lastSchedule },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
    <>
      <MenuItem onClick={() => CronJobTriggerDialog.open(object)}>
        <Icon material="play_circle_filled" title="Trigger" interactive={toolbar}/>
        <span className="title">Trigger</span>
      </MenuItem>

      {object.isSuspend() ?
        <MenuItem onClick={() => ConfirmDialog.open({
          ok: async () => {
            try {
              await cronJobApi.resume({ namespace: object.getNs(), name: object.getName() });
            } catch (err) {
              Notifications.error(err);
            }
          },
          labelOk: `Resume`,
          message: (
            <p>
              Resume CronJob <b>{object.getName()}</b>?
            </p>),
        })}>
          <Icon material="play_circle_outline" title="Resume" interactive={toolbar}/>
          <span className="title">Resume</span>
        </MenuItem>

        : <MenuItem onClick={() => ConfirmDialog.open({
          ok: async () => {
            try {
              await cronJobApi.suspend({ namespace: object.getNs(), name: object.getName() });
            } catch (err) {
              Notifications.error(err);
            }
          },
          labelOk: `Suspend`,
          message: (
            <p>
              Suspend CronJob <b>{object.getName()}</b>?
            </p>),
        })}>
          <Icon material="pause_circle_filled" title="Suspend" interactive={toolbar}/>
          <span className="title">Suspend</span>
        </MenuItem>
      }
    </>
  );
}

kubeObjectMenuRegistry.add({
  kind: "CronJob",
  apiVersions: ["batch/v1beta1"],
  components: {
    MenuItem: CronJobMenu
  }
});
