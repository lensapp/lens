/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { DaemonSet } from "../../../common/k8s-api/endpoints";
import { eventStore } from "../+events/event.store";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { DaemonSetsRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  labels = "labels",
  age = "age",
}

interface Props extends RouteComponentProps<DaemonSetsRouteParams> {
}

@observer
export class DaemonSets extends React.Component<Props> {
  getPodsLength(daemonSet: DaemonSet) {
    return daemonSetStore.getChildPods(daemonSet).length;
  }

  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_daemonsets"
        className="DaemonSets" store={daemonSetStore}
        dependentStores={[podsStore, eventStore]} // status icon component uses event store
        sortingCallbacks={{
          [columnId.name]: daemonSet => daemonSet.getName(),
          [columnId.namespace]: daemonSet => daemonSet.getNs(),
          [columnId.pods]: daemonSet => this.getPodsLength(daemonSet),
          [columnId.age]: daemonSet => daemonSet.getTimeDiffFromNow(),
        }}
        searchFilters={[
          daemonSet => daemonSet.getSearchFields(),
          daemonSet => daemonSet.getLabels(),
        ]}
        renderHeaderTitle="Daemon Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
          { className: "warning", showWithColumn: columnId.pods },
          { title: "Node Selector", className: "labels scrollable", id: columnId.labels },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={daemonSet => [
          daemonSet.getName(),
          daemonSet.getNs(),
          this.getPodsLength(daemonSet),
          <KubeObjectStatusIcon key="icon" object={daemonSet}/>,
          daemonSet.getNodeSelectors().map(selector => (
            <Badge key={selector} label={selector} scrollable/>
          )),
          daemonSet.getAge(),
        ]}
      />
    );
  }
}
