import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { DaemonSet } from "../../api/endpoints";
import { eventStore } from "../+events/event.store";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { nodesStore } from "../+nodes/nodes.store";
import { KubeObjectListLayout } from "../kube-object";
import { IDaemonSetsRouteParams } from "../+workloads";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  labels = "labels",
  age = "age",
}

interface Props extends RouteComponentProps<IDaemonSetsRouteParams> {
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
