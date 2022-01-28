/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { CronJobStore } from "./store";
import type { JobStore } from "../+jobs/store";
import type { EventStore } from "../+events/store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { CronJobsRouteParams } from "../../../common/routes";
import moment from "moment";
import { withInjectables } from "@ogre-tools/injectable-react";
import { CronJobMenu } from "./item-menu";
import cronJobStoreInjectable from "./store.injectable";
import jobStoreInjectable from "../+jobs/store.injectable";
import eventStoreInjectable from "../+events/store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  schedule = "schedule",
  suspend = "suspend",
  active = "active",
  lastSchedule = "last-schedule",
  age = "age",
}

export interface CronJobsProps extends RouteComponentProps<CronJobsRouteParams> {
}

interface Dependencies {
  cronJobStore: CronJobStore;
  jobStore: JobStore;
  eventStore: EventStore;
}

const NonInjectedCronJobs = observer(({ cronJobStore, jobStore, eventStore }: Dependencies & CronJobsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_cronjobs"
    className="CronJobs"
    store={cronJobStore}
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
    renderItemMenu={item => <CronJobMenu object={item}/>}
  />
));

export const CronJobs = withInjectables<Dependencies, CronJobsProps>(NonInjectedCronJobs, {
  getProps: (di, props) => ({
    cronJobStore: di.inject(cronJobStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    eventStore: di.inject(eventStoreInjectable),
    ...props,
  }),
});
