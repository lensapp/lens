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

import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { CronJob, cronJobApi } from "../../api/endpoints/cron-job.api";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { cronJobStore } from "./cronjob.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { eventStore } from "../+events/event.store";
import type { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
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
