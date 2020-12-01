import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { t, Trans } from "@lingui/macro";
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
import { _i18n } from "../../i18n";
import { Icon } from "../icon/icon";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";

enum sortBy {
  name = "name",
  namespace = "namespace",
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
        className="StatefulSets" store={statefulSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (statefulSet: StatefulSet) => statefulSet.getName(),
          [sortBy.namespace]: (statefulSet: StatefulSet) => statefulSet.getNs(),
          [sortBy.age]: (statefulSet: StatefulSet) => statefulSet.metadata.creationTimestamp,
          [sortBy.replicas]: (statefulSet: StatefulSet) => statefulSet.getReplicas(),
        }}
        searchFilters={[
          (statefulSet: StatefulSet) => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle={<Trans>Stateful Sets</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Pods</Trans>, className: "pods" },
          { title: <Trans>Replicas</Trans>, className: "replicas", sortBy: sortBy.replicas },
          { className: "warning" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
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
        <Icon material="open_with" title={_i18n._(t`Scale`)} interactive={toolbar}/>
        <span className="title"><Trans>Scale</Trans></span>
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
