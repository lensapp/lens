/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./jobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { jobStore } from "./job.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import kebabCase from "lodash/kebabCase";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { JobsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  completions = "completions",
  conditions = "conditions",
  age = "age",
}

export interface JobsProps extends RouteComponentProps<JobsRouteParams> {
}

@observer
export class Jobs extends React.Component<JobsProps> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_jobs"
        className="Jobs" store={jobStore}
        dependentStores={[eventStore]} // status icon component uses event store
        sortingCallbacks={{
          [columnId.name]: job => job.getName(),
          [columnId.namespace]: job => job.getNs(),
          [columnId.conditions]: job => job.getCondition() != null ? job.getCondition().type : "",
          [columnId.age]: job => job.getTimeDiffFromNow(),
        }}
        searchFilters={[
          job => job.getSearchFields(),
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
        renderTableContents={job => {
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
            },
          ];
        }}
      />
    );
  }
}
