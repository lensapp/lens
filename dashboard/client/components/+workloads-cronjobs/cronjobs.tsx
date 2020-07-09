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
import { CronJobsRouteParams } from "../+workloads";
import { KubeObjectListLayout } from "../kube-object";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { apiManager } from "../../api/api-manager";
import { KubeEvent } from "client/api/endpoints/events.api";

enum sortBy {
  name = "name",
  namespace = "namespace",
  suspend = "suspend",
  active = "active",
  lastSchedule = "schedule",
  age = "age",
}

interface Props extends RouteComponentProps<CronJobsRouteParams> {
}

@observer
export class CronJobs extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="CronJobs" store={cronJobStore}
        dependentStores={[jobStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (cronJob: CronJob): string => cronJob.getName(),
          [sortBy.namespace]: (cronJob: CronJob): string => cronJob.getNs(),
          [sortBy.suspend]: (cronJob: CronJob): string => cronJob.getSuspendFlag(),
          [sortBy.active]: (cronJob: CronJob): number => cronJobStore.getActiveJobsNum(cronJob),
          [sortBy.lastSchedule]: (cronJob: CronJob): string => cronJob.getLastScheduleTime(),
          [sortBy.age]: (cronJob: CronJob): string => cronJob.metadata.creationTimestamp,
        }}
        searchFilters={[
          (cronJob: CronJob): string[] => cronJob.getSearchFields(),
          (cronJob: CronJob): string => cronJob.getSchedule(),
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
        renderTableContents={(cronJob: CronJob): (string | number | JSX.Element)[] => [
          cronJob.getName(),
          <KubeEventIcon key="events" object={cronJob} filterEvents={(events): KubeEvent[] => {
            if (!cronJob.isNeverRun()) {
              return events;
            }
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
        renderItemMenu={(item: CronJob): JSX.Element => {
          return <CronJobMenu object={item}/>;
        }}
      />
    );
  }
}

export function CronJobMenu(props: KubeObjectMenuProps<CronJob>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(cronJobApi, {
  Menu: CronJobMenu,
});
