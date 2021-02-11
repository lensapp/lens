import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { StatefulSet } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { IStatefulSetsRouteParams } from "../+workloads";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { StatefulSetScaleDialog } from "./statefulset-scale-dialog";
import { MenuItem } from "../menu/menu";
import { Icon } from "../icon/icon";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
  replicas = "replicas",
}

interface Props extends RouteComponentProps<IStatefulSetsRouteParams> {
}

@observer
export class StatefulSets extends React.Component<Props> {
  renderPods(statefulSet: StatefulSet) {
    const { readyReplicas, currentReplicas } = statefulSet.status;

    return `${readyReplicas || 0}/${currentReplicas || 0}`;
  }

  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="workload_statefulsets"
        className="StatefulSets" store={statefulSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [columnId.name]: (statefulSet: StatefulSet) => statefulSet.getName(),
          [columnId.namespace]: (statefulSet: StatefulSet) => statefulSet.getNs(),
          [columnId.age]: (statefulSet: StatefulSet) => statefulSet.metadata.creationTimestamp,
          [columnId.replicas]: (statefulSet: StatefulSet) => statefulSet.getReplicas(),
        }}
        searchFilters={[
          (statefulSet: StatefulSet) => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle="Stateful Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Pods", className: "pods", id: columnId.pods },
          { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
          { className: "warning", showWithColumn: columnId.replicas },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(statefulSet: StatefulSet) => [
          statefulSet.getName(),
          statefulSet.getNs(),
          this.renderPods(statefulSet),
          statefulSet.getReplicas(),
          <KubeObjectStatusIcon key="icon" object={statefulSet}/>,
          statefulSet.getAge(),
        ]}
        renderItemMenu={(item: StatefulSet) => {
          return <StatefulSetMenu object={item}/>;
        }}
      />
    );
  }
}

export function StatefulSetMenu(props: KubeObjectMenuProps<StatefulSet>) {
  const { object, toolbar } = props;

  return (
    <>
      <MenuItem onClick={() => StatefulSetScaleDialog.open(object)}>
        <Icon material="open_with" title={`Scale`} interactive={toolbar}/>
        <span className="title">Scale</span>
      </MenuItem>
    </>
  );
}

kubeObjectMenuRegistry.add({
  kind: "StatefulSet",
  apiVersions: ["apps/v1"],
  components: {
    MenuItem: StatefulSetMenu
  }
});
