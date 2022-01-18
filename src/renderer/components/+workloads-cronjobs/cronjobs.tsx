/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { CronJob, cronJobApi } from "../../../common/k8s-api/endpoints/cron-job.api";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { cronJobStore } from "./cronjob.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { eventStore } from "../+events/event.store";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { CronJobTriggerDialog } from "./cronjob-trigger-dialog";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { ConfirmDialog } from "../confirm-dialog/confirm-dialog";
import { Notifications } from "../notifications/notifications";
import type { CronJobsRouteParams } from "../../../common/routes";
import moment from "moment";

enum columnId {
  name = "name",
  namespace = "namespace",
  schedule = "schedule",
  suspend = "suspend",
  active = "active",
  lastSchedule = "last-schedule",
  age = "age",
}

interface Props extends RouteComponentProps<CronJobsRouteParams> {
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
          [columnId.name]: cronJob => cronJob.getName(),
          [columnId.namespace]: cronJob => cronJob.getNs(),
          [columnId.suspend]: cronJob => cronJob.getSuspendFlag(),
          [columnId.active]: cronJob => cronJobStore.getActiveJobsNum(cronJob),
          [columnId.lastSchedule]: cronJob => (
            cronJob.status?.lastScheduleTime
              ? moment().diff(cronJob.status.lastScheduleTime)
              : 0
          ),
          [columnId.age]: cronJob => cronJob.getTimeDiffFromNow(),
        }}
        searchFilters={[
          cronJob => cronJob.getSearchFields(),
          cronJob => cronJob.getSchedule(),
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
        renderTableContents={cronJob => [
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
        <Icon material="play_circle_filled" tooltip="Trigger" interactive={toolbar}/>
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
          <Icon material="play_circle_outline" tooltip="Resume" interactive={toolbar}/>
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
          <Icon material="pause_circle_filled" tooltip="Suspend" interactive={toolbar}/>
          <span className="title">Suspend</span>
        </MenuItem>
      }
    </>
  );
}
