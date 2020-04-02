import "./cronjobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { CronJob, cronJobApi } from "../../api/endpoints/cron-job.api";
import { cronJobStore } from "./cronjob.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { ICronJobsRouteParams } from "../+workloads";
import { KubeObjectListLayout } from "../kube-object";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { apiManager } from "../../api/api-manager";

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
          [sortBy.age]: (cronJob: CronJob) => cronJob.getAge(false),
        }}
        searchFilters={[
          (cronJob: CronJob) => cronJob.getSearchFields(),
          (cronJob: CronJob) => cronJob.getSchedule(),
        ]}
        renderHeaderTitle={<Trans>Cron Jobs</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Schedule</Trans>, className: "schedule" },
          { title: <Trans>Suspend</Trans>, className: "suspend", sortBy: sortBy.suspend },
          { title: <Trans>Active</Trans>, className: "active", sortBy: sortBy.active },
          { title: <Trans>Last schedule</Trans>, className: "last-schedule", sortBy: sortBy.lastSchedule },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(cronJob: CronJob) => [
          cronJob.getName(),
          <KubeEventIcon object={cronJob} filterEvents={events => {
            if (!cronJob.isNeverRun()) return events;
            return events.filter(event => event.reason != "FailedNeedsStart");
          }
          }/>,
          cronJob.getNs(),
          cronJob.isNeverRun() ? <Trans>never</Trans> : cronJob.getSchedule(),
          cronJob.getSuspendFlag(),
          cronJobStore.getActiveJobsNum(cronJob),
          cronJob.getLastScheduleTime(),
          cronJob.getAge(),
        ]}
        renderItemMenu={(item: CronJob) => {
          return <CronJobMenu object={item}/>
        }}
      />
    )
  }
}

export function CronJobMenu(props: KubeObjectMenuProps<CronJob>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(cronJobApi, {
  Menu: CronJobMenu,
})