import "./jobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { podsStore } from "../+workloads-pods/pods.store";
import { jobStore } from "./job.store";
import { eventStore } from "../+events/event.store";
import { Job, jobApi } from "../../api/endpoints/job.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { JobsRouteParams } from "../+workloads";
import { KubeEventIcon } from "../+events/kube-event-icon";
import kebabCase from "lodash/kebabCase";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  conditions = "conditions",
  age = "age",
}

interface Props extends RouteComponentProps<JobsRouteParams> {
}

@observer
export class Jobs extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="Jobs" store={jobStore}
        dependentStores={[podsStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (job: Job): string => job.getName(),
          [sortBy.namespace]: (job: Job): string => job.getNs(),
          [sortBy.conditions]: (job: Job): string => job.getCondition() != null ? job.getCondition().type : "",
          [sortBy.age]: (job: Job): string => job.metadata.creationTimestamp,
        }}
        searchFilters={[
          (job: Job): string[]=> job.getSearchFields(),
        ]}
        renderHeaderTitle={<Trans>Jobs</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Completions</Trans>, className: "completions" },
          { className: "warning" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Conditions</Trans>, className: "conditions", sortBy: sortBy.conditions },
        ]}
        renderTableContents={(job: Job): (string | React.ReactNode | JSX.Element)[] => {
          const condition = job.getCondition();
          return [
            job.getName(),
            job.getNs(),
            `${job.getCompletions()} / ${job.getDesiredCompletions()}`,
            <KubeEventIcon key="job" object={job}/>,
            job.getAge(),
            condition && {
              title: condition.type,
              className: kebabCase(condition.type),
            }
          ];
        }}
        renderItemMenu={(item: Job): JSX.Element => {
          return <JobMenu object={item}/>;
        }}
      />
    );
  }
}

export function JobMenu(props: KubeObjectMenuProps<Job>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(jobApi, {
  Menu: JobMenu,
});
