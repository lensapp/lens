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

interface Props extends RouteComponentProps<JobsRouteParams> {
}

@observer
export class Jobs extends React.Component<Props> {
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
