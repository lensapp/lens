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

import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../api/endpoints";
import type { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { replicaSetStore } from "./replicasets.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object/kube-object-list-layout";
import { MenuItem } from "../menu/menu";
import { Icon } from "../icon/icon";
import { ReplicaSetScaleDialog } from "./replicaset-scale-dialog";
import type { ReplicaSetsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  desired = "desired",
  current = "current",
  ready = "ready",
  age = "age",
}

interface Props extends RouteComponentProps<ReplicaSetsRouteParams> {
}

@observer
export class ReplicaSets extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_replicasets"
        className="ReplicaSets" store={replicaSetStore}
        sortingCallbacks={{
          [columnId.name]: replicaSet => replicaSet.getName(),
          [columnId.namespace]: replicaSet => replicaSet.getNs(),
          [columnId.desired]: replicaSet => replicaSet.getDesired(),
          [columnId.current]: replicaSet => replicaSet.getCurrent(),
          [columnId.ready]: replicaSet => replicaSet.getReady(),
          [columnId.age]: replicaSet => replicaSet.getTimeDiffFromNow(),
        }}
        searchFilters={[
          replicaSet => replicaSet.getSearchFields(),
        ]}
        renderHeaderTitle="Replica Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Desired", className: "desired", sortBy: columnId.desired, id: columnId.desired },
          { title: "Current", className: "current", sortBy: columnId.current, id: columnId.current },
          { title: "Ready", className: "ready", sortBy: columnId.ready, id: columnId.ready },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={replicaSet => [
          replicaSet.getName(),
          <KubeObjectStatusIcon key="icon" object={replicaSet}/>,
          replicaSet.getNs(),
          replicaSet.getDesired(),
          replicaSet.getCurrent(),
          replicaSet.getReady(),
          replicaSet.getAge(),
        ]}
        renderItemMenu={(item: ReplicaSet) => {
          return <ReplicaSetMenu object={item}/>;
        }}
      />
    );
  }
}

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => ReplicaSetScaleDialog.open(object)}>
        <Icon material="open_with" tooltip="Scale" interactive={toolbar}/>
        <span className="title">Scale</span>
      </MenuItem>
    </>
  );
}
