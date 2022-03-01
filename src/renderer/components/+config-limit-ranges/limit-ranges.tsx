/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./limit-ranges.scss";

import type { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { limitRangeStore } from "./limit-ranges.store";
import React from "react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { LimitRangeRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  age = "age",
}

export interface LimitRangesProps extends RouteComponentProps<LimitRangeRouteParams> {
}

@observer
export class LimitRanges extends React.Component<LimitRangesProps> {
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
