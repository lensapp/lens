/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { replicaSetStore } from "./replicasets.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { MenuItem } from "../menu/menu";
import { Icon } from "../icon/icon";
import { ReplicaSetScaleDialog } from "./replicaset-scale-dialog";
import type { ReplicaSetsRouteParams } from "../../../common/routes";
import { eventStore } from "../+events/event.store";

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
        dependentStores={[eventStore]} // status icon component uses event store
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
