/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { cronJobStore } from "./legacy-store";
import { jobStore } from "../+workloads-jobs/legacy-store";
import { eventStore } from "../+events/legacy-store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import moment from "moment";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

enum columnId {
  name = "name",
  namespace = "namespace",
  schedule = "schedule",
  suspend = "suspend",
  active = "active",
  lastSchedule = "last-schedule",
  age = "age",
}

@observer
export class CronJobs extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
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
            [columnId.age]: cronJob => -cronJob.getCreationTimestamp(),
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
            <KubeObjectAge key="age" object={cronJob} />,
          ]}
        />
      </SiblingsInTabLayout>
    );
  }
}

