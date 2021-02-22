import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import { ReplicaSet } from "../../api/endpoints";
import { KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { replicaSetStore } from "./replicasets.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { RouteComponentProps } from "react-router";
import { IReplicaSetsRouteParams } from "../+workloads/workloads.route";
import { KubeObjectListLayout } from "../kube-object/kube-object-list-layout";
import { MenuItem } from "../menu/menu";
import { Icon } from "../icon/icon";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";
import { ReplicaSetScaleDialog } from "./replicaset-scale-dialog";

enum columnId {
  name = "name",
  namespace = "namespace",
  desired = "desired",
  current = "current",
  ready = "ready",
  age = "age",
}

interface Props extends RouteComponentProps<IReplicaSetsRouteParams> {
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
          [columnId.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
          [columnId.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
          [columnId.desired]: (replicaSet: ReplicaSet) => replicaSet.getDesired(),
          [columnId.current]: (replicaSet: ReplicaSet) => replicaSet.getCurrent(),
          [columnId.ready]: (replicaSet: ReplicaSet) => replicaSet.getReady(),
          [columnId.age]: (replicaSet: ReplicaSet) => replicaSet.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (replicaSet: ReplicaSet) => replicaSet.getSearchFields(),
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
        renderTableContents={(replicaSet: ReplicaSet) => [
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
        <Icon material="open_with" title="Scale" interactive={toolbar}/>
        <span className="title">Scale</span>
      </MenuItem>
    </>
  );
}

kubeObjectMenuRegistry.add({
  kind: "ReplicaSet",
  apiVersions: ["apps/v1"],
  components: {
    MenuItem: ReplicaSetMenu
  }
});
