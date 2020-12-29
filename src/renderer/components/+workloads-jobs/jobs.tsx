import "./jobs.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { podsStore } from "../+workloads-pods/pods.store";
import { jobStore } from "./job.store";
import { eventStore } from "../+events/event.store";
import { Job } from "../../api/endpoints/job.api";
import { KubeObjectListLayout } from "../kube-object";
import { IJobsRouteParams } from "../+workloads";
import kebabCase from "lodash/kebabCase";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  conditions = "conditions",
  age = "age",
}

interface Props extends RouteComponentProps<IJobsRouteParams> {
}

@observer
export class Jobs extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="Jobs" store={jobStore}
        dependentStores={[podsStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (job: Job) => job.getName(),
          [sortBy.namespace]: (job: Job) => job.getNs(),
          [sortBy.conditions]: (job: Job) => job.getCondition() != null ? job.getCondition().type : "",
          [sortBy.age]: (job: Job) => job.metadata.creationTimestamp,
        }}
        searchFilters={[
          (job: Job) => job.getSearchFields(),
        ]}
        renderHeaderTitle="Jobs"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Completions", className: "completions" },
          { className: "warning" },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Conditions", className: "conditions", sortBy: sortBy.conditions },
        ]}
        renderTableContents={(job: Job) => {
          const condition = job.getCondition();

          return [
            job.getName(),
            job.getNs(),
            `${job.getCompletions()} / ${job.getDesiredCompletions()}`,
            <KubeObjectStatusIcon key="icon" object={job}/>,
            job.getAge(),
            condition && {
              title: condition.type,
              className: kebabCase(condition.type),
            }
          ];
        }}
      />
    );
  }
}
