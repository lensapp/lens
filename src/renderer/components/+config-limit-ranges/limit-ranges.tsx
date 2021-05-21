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

import "./limit-ranges.scss";

import type { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object/kube-object-list-layout";
import { limitRangeStore } from "./limit-ranges.store";
import React from "react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { LimitRangeRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<LimitRangeRouteParams> {
}

@observer
export class LimitRanges extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="configuration_limitranges"
        className="LimitRanges"
        store={limitRangeStore}
        sortingCallbacks={{
          [columnId.name]: item => item.getName(),
          [columnId.namespace]: item => item.getNs(),
          [columnId.age]: item => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          item => item.getName(),
          item => item.getNs(),
        ]}
        renderHeaderTitle="Limit Ranges"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={limitRange => [
          limitRange.getName(),
          <KubeObjectStatusIcon key="icon" object={limitRange}/>,
          limitRange.getNs(),
          limitRange.getAge(),
        ]}
      />
    );
  }
}
