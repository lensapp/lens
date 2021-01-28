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

enum columnId {
  name = "name",
  namespace = "namespace",
  completions = "completions",
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
        isConfigurable
        tableId="workload_jobs"
        className="Jobs" store={jobStore}
        dependentStores={[podsStore, eventStore]}
        sortingCallbacks={{
          [columnId.name]: (job: Job) => job.getName(),
          [columnId.namespace]: (job: Job) => job.getNs(),
          [columnId.conditions]: (job: Job) => job.getCondition() != null ? job.getCondition().type : "",
          [columnId.age]: (job: Job) => job.metadata.creationTimestamp,
        }}
        searchFilters={[
          (job: Job) => job.getSearchFields(),
        ]}
        renderHeaderTitle="Jobs"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Completions", className: "completions", id: columnId.completions },
          { className: "warning", showWithColumn: columnId.completions },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Conditions", className: "conditions", sortBy: columnId.conditions, id: columnId.conditions },
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
