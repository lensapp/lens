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

import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { DaemonSet } from "../../api/endpoints";
import { eventStore } from "../+events/event.store";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { nodesStore } from "../+nodes/nodes.store";
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

  renderNodeSelector(daemonSet: DaemonSet) {
    return daemonSet.getNodeSelectors().map(selector => (
      <Badge key={selector} label={selector}/>
    ));
  }

  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_daemonsets"
        className="DaemonSets" store={daemonSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [columnId.name]: (daemonSet: DaemonSet) => daemonSet.getName(),
          [columnId.namespace]: (daemonSet: DaemonSet) => daemonSet.getNs(),
          [columnId.pods]: (daemonSet: DaemonSet) => this.getPodsLength(daemonSet),
          [columnId.age]: (daemonSet: DaemonSet) => daemonSet.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (daemonSet: DaemonSet) => daemonSet.getSearchFields(),
          (daemonSet: DaemonSet) => daemonSet.getLabels(),
        ]}
        renderHeaderTitle="Daemon Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
          { className: "warning", showWithColumn: columnId.pods },
          { title: "Node Selector", className: "labels", id: columnId.labels },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(daemonSet: DaemonSet) => [
          daemonSet.getName(),
          daemonSet.getNs(),
          this.getPodsLength(daemonSet),
          <KubeObjectStatusIcon key="icon" object={daemonSet}/>,
          this.renderNodeSelector(daemonSet),
          daemonSet.getAge(),
        ]}
      />
    );
  }
}
