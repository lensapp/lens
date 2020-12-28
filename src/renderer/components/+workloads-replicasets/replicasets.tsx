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

enum sortBy {
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
        className="ReplicaSets" store={replicaSetStore}
        sortingCallbacks={{
          [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
          [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
          [sortBy.desired]: (replicaSet: ReplicaSet) => replicaSet.getDesired(),
          [sortBy.current]: (replicaSet: ReplicaSet) => replicaSet.getCurrent(),
          [sortBy.ready]: (replicaSet: ReplicaSet) => replicaSet.getReady(),
          [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.metadata.creationTimestamp,
        }}
        searchFilters={[
          (replicaSet: ReplicaSet) => replicaSet.getSearchFields(),
        ]}
        renderHeaderTitle="Replica Sets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Desired", className: "desired", sortBy: sortBy.desired },
          { title: "Current", className: "current", sortBy: sortBy.current },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Age", className: "age", sortBy: sortBy.age },
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
        <Icon material="open_with" title={`Scale`} interactive={toolbar}/>
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
