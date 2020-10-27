import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Trans } from "@lingui/macro";
import { StatefulSet, statefulSetApi } from "../../api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { nodesStore } from "../+nodes/nodes.store";
import { eventStore } from "../+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { IStatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "../+events/kube-event-icon";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps<IStatefulSetsRouteParams> {
}

@observer
export class StatefulSets extends React.Component<Props> {
  getPodsLength(statefulSet: StatefulSet) {
    return statefulSetStore.getChildPods(statefulSet).length;
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
          [sortBy.pods]: (statefulSet: StatefulSet) => this.getPodsLength(statefulSet),
        }}
        searchFilters={[
          (statefulSet: StatefulSet) => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle={<Trans>Stateful Sets</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Pods</Trans>, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(statefulSet: StatefulSet) => [
          statefulSet.getName(),
          statefulSet.getNs(),
          this.getPodsLength(statefulSet),
          <KubeEventIcon object={statefulSet}/>,
          statefulSet.getAge(),
        ]}
      />
    )
  }
}
